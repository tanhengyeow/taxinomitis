// core dependencies
import * as fs from 'fs';
// external dependencies
import * as request from 'request';
import * as httpstatus from 'http-status';
import * as sharp from 'sharp';
import * as probe from 'probe-image-size';
// local dependencies
import loggerSetup from './logger';

const log = loggerSetup();

// number of times an image download has been attempted
let numDownloads = 0;
// number of failures to download an image
let numErrors = 0;


type IErrCallback = (err?: Error) => void;


// disable aggressive use of memory for caching
sharp.cache(false);
// prevent sharp using multiple cores in parallel to reduce memory use
sharp.concurrency(1);

// standard options for downloading images
const REQUEST_OPTIONS = {
    timeout : 10000,
    rejectUnauthorized : false,
    strictSSL : false,
    gzip : true,
    headers : {
        // identify source of the request
        //  partly as it's polite and good practice,
        //  partly as some websites block requests that don't specify a user-agent
        'User-Agent': 'machinelearningforkids.co.uk',
        // prefer images if we have a choice
        'Accept': 'image/png,image/jpeg,image/*,*/*',
        // some servers block requests that don't include this
        'Accept-Language': '*',
    },
};


/**
 * Downloads a file from the specified URL to the specified location on disk.
 *
 * @param url  - downloads from
 * @param targetFilePath  - writes to
 */
export function file(url: string, targetFilePath: string, callback: IErrCallback): void {

    // local inner function used to avoid calling callback multiple times
    let resolved = false;
    function resolve(err?: Error) {
        if (resolved === false) {
            resolved = true;
            return callback(err);
        }
    }

    const writeStream = fs.createWriteStream(targetFilePath)
                            .on('error', resolve)
                            .on('finish', resolve);

    try {
        numDownloads += 1;

        request.get({ ...REQUEST_OPTIONS, url })
            .on('error', (err) => {
                numErrors += 1;

                log.error({ err, numDownloads, numErrors }, 'request get fail');
                resolve(new Error(ERRORS.DOWNLOAD_FAIL + url));
            })
            .pipe(writeStream);
    }
    catch (err) {
        log.error({ err, url }, 'Failed to download file');
        resolve(new Error(ERRORS.DOWNLOAD_FAIL + url));
    }
}




/**
 * Downloads a file from the specified URL to the specified location on disk.
 *
 * @param url  - downloads from
 * @param width - width (in pixels) to resize the image to
 * @param height - height (in pixels) to resize the image to
 * @param targetFilePath  - writes to
 */
export function resize(
    url: string,
    width: number, height: number,
    targetFilePath: string,
    callback: IErrCallback,
): void
{
    // local inner function used to avoid calling callback multiple times
    let resolved = false;
    function resolve(err?: Error) {
        if (resolved === false) {
            resolved = true;
            return callback(err);
        }
    }

    probe(url, { rejectUnauthorized : false })
        .then((imageinfo: any) => {
            if (imageinfo.type !== 'jpg' && imageinfo.type !== 'jpeg' && imageinfo.type !== 'png') {
                log.error({ imageinfo, url }, 'Unexpected file type');
                throw new Error('Unsupported file type ' + imageinfo.type);
            }

            // skew, don't crop, when resizing
            const options = { fit : 'fill' } as sharp.ResizeOptions;

            const shrinkStream = sharp()
                                    // resize before writing to disk
                                    .resize(width, height, options)
                                    .on('error', resolve)
                                    // write to file using the same image
                                    //  format (i.e. jpg vs png) as the
                                    //  original
                                    .toFile(targetFilePath, resolve);

            request.get({ ...REQUEST_OPTIONS, url })
                .on('error', (err) => {
                    log.warn({ err, url }, 'Download fail (request)');
                    resolve(new Error(ERRORS.DOWNLOAD_FAIL + url));
                })
                .pipe(shrinkStream);
        })
        .catch ((err: any) => {
            if (err.statusCode === httpstatus.NOT_FOUND || err.message === 'ETIMEDOUT') {
                log.warn({ err, url }, 'Image could not be downloaded');
            }
            else {
                log.error({ err, url }, 'Download fail (probe)');
            }
            resolve(new Error(ERRORS.DOWNLOAD_FAIL + url));
        });
}



export const ERRORS = {
    DOWNLOAD_FAIL : 'Unable to download image from ',
};

'use strict';
const multer = require('multer');
const csv = require('fast-csv');
const fs = require('fs');
const logger = require('../utils/logger.js');
const async = require('async');
const response = require('../helpers/response.js');
const path = require('path');
const { Parser } = require('json2csv');
let digitOnlyRegex = /\d+/g;
const _ = require('lodash');

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        let date = Date.now();
        cb(null, file.fieldname + '-' + date + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});

var upload = multer({
    storage: storage
}).single('file');



exports.csvParser = async function (req, res, next) {
    try {
        let parsedData = [];
        let csvFile = '';
        let isReturnCSV = req.query.isReturnCSV || true;
        upload(req, res, async function (err) {
            if (err) {
                let message = "Exception";
                logger.error(err);
                if (err.code === 'ENOENT') {
                    message = "No such file or directory";
                }
                return next(err);
            } else {
                let file = req.file;
                let index = 0;
                logger.info("originalname format ====>" + file.originalname.split('.')[file.originalname.split('.').length - 1]);
                if (file.originalname.split('.')[file.originalname.split('.').length - 1] === 'csv') {
                    let stream = fs.createReadStream(file.path);
                    stream.pipe(csv.parse({ headers: true })).on("data", function (data) {
                    }).transform(async function (data, next) {
                        index++;
                        if (index !== -1) {
                            parsedData.push(data);
                            next();
                        } else {
                            next();
                        }
                    }).on("end", async function () {
                        fs.unlink(file.path, (err) => {
                            if (err) console.error(err);
                            logger.info(`${file.path} was deleted`);
                        });
                        if (parsedData && parsedData.length > 0) {
                            // console.log(parsedData, 'pas')
                            if (!isReturnCSV) {
                                let datum = await modifiedData(req, parsedData);
                                return response.provideSuccessResult(res, 'Successfully Parsed!', datum);
                            } else {
                                let datum = await modifiedData(req, parsedData);
                                let headers = Object.keys(datum[0]);
                                // console.log(headers)
                                // console.log(datum[0])
                                let csvResponse = await returnJsonToCSV(req, headers, parsedData);
                                return response.provideCSVFileResult(res, csvResponse);
                            }
                        } else {
                            return response.provideSuccessResult(res, 'No Records Found')
                        }
                    });
                } else {
                    return response.provideErrorResult(res, null, 'Invalid File');
                }
            }
        })
    } catch (err) {
        logger.error(err);
        if (fs.existsSync(file.path)) {
            fs.unlink(file.path, (err) => {
                if (err) console.log(err);
                console.log(`${file.path} was deleted`);
            });
        }
        return next(err);
    }
};



const returnJsonToCSV = async (req, headers, data) => {
    return new Promise((resolve, reject) => {
        try {
            const fields = [...headers];
            const opts = { fields };
            const parser = new Parser(opts);
            const csv = parser.parse(data);
            return resolve(csv);
        } catch (err) {
            return reject(err);
        }
    });
};


const modifiedData = async (req, data) => {
    return new Promise((resolve, reject) => {
        if (data && data.length > 0) {
            try {
                let returnData = data;
                
                data.forEach(d => {
                    d.HUID = d.HUID && d.HUID.trim() != '' ? d.HUID.replace('.', '').trim() : '';
                    d.product = stockMaster.find(f=>{ return f.ITEM_ID == d.ITEM_ID}) && stockMaster.find(f=>{ return f.ITEM_ID == d.ITEM_ID}).CATEGORY ? stockMaster.find(f=>{ return f.ITEM_ID == d.ITEM_ID}).CATEGORY : ''
                    // d.time  = d.Date.split(' ')[1]
                    // d.time = d.time && d.time.split(':')[0] && d.time.split(':')[0] < 12 ? 'AM' : 'PM' 
                    console.log(d)
                    returnData.push(d);
                });
                return resolve(returnData);
            } catch (err) {
                return reject(err);
            }
        } else {
            return reject(new Error('No data'));
        }
    });
};

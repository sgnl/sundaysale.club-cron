#!/usr/bin/env node

const got = require('got');
const moment = require('moment');
const Promise = require('bluebird');

const logger = require('./services/logger');
const { addNewBrochureUrl } = require('./services/mongo');

const { createCampaignAndSend } = require('./services/mail');

const islands = ['oahu', 'maui', 'kauai', 'kona', 'hilo'];

const day =  7;
// get the nearest sunday and return two-digit month and day combination
const date = moment().day(day).format('MMDD');

if (process.env.ENVIRONMENT === 'DEVELOPMENT') {
  require('dotenv').config();
}

const allBrochures = islands.map(island => {
  return {
    date_added: moment().day(day).format('MMM Do YYYY'),
    island,
    url: `http://longs.staradvertiser.com/${island}/${date}/pdf/${island}${date}.pdf`
  };
});

console.log(allBrochures);

const asyncCollection = allBrochures.map(brochure => addNewBrochureUrl(brochure))
  .concat(createCampaignAndSend(allBrochures));

Promise.all(asyncCollection)
  .then(() => {
    logger.info('all done yay');
  });

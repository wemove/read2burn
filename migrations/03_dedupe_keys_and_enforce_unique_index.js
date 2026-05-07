'use strict';

const Bluebird = require('bluebird');
const app = require('../app');

function consumedRank(doc) {
    return doc && doc.consumed === true ? 1 : 0;
}

function timestampValue(doc) {
    return Number.isFinite(doc && doc.timestamp) ? doc.timestamp : 0;
}

function chooseEntryToKeep(entries) {
    // Keep-policy for duplicate keys:
    // 1) prefer unconsumed entries (still readable),
    // 2) then keep the newest by timestamp,
    // 3) then choose deterministically by _id.
    const sorted = entries.slice().sort(function (a, b) {
        const consumedDiff = consumedRank(a) - consumedRank(b);
        if (consumedDiff !== 0) return consumedDiff;

        const timestampDiff = timestampValue(b) - timestampValue(a);
        if (timestampDiff !== 0) return timestampDiff;

        return String(a._id).localeCompare(String(b._id));
    });
    return sorted[0];
}

module.exports = {
    up: function () {
        return new Bluebird(function (resolve, reject) {
            console.log('MIGRATION 03_dedupe_keys_and_enforce_unique_index.js: start deduping keys.');
            const nedb = app.nedb;

            nedb.find({}, function (findErr, docs) {
                if (findErr) return reject(findErr);

                const entriesByKey = new Map();
                docs.forEach(function (doc) {
                    if (!doc || !doc.key) return;
                    const groupedEntries = entriesByKey.get(doc.key) || [];
                    groupedEntries.push(doc);
                    entriesByKey.set(doc.key, groupedEntries);
                });

                const idsToRemove = [];
                entriesByKey.forEach(function (entries, key) {
                    if (entries.length <= 1) return;
                    const entryToKeep = chooseEntryToKeep(entries);
                    // Remove all siblings for this key, keep only the selected winner.
                    entries.forEach(function (entry) {
                        if (entry._id !== entryToKeep._id) {
                            idsToRemove.push(entry._id);
                        }
                    });
                    console.log(`Deduping key "${key}": keeping ${entryToKeep._id}, removing ${entries.length - 1}.`);
                });

                const finalize = function () {
                    // Re-ensure uniqueness after cleanup so future writes cannot recreate duplicates.
                    nedb.ensureIndex({ fieldName: 'key', unique: true }, function (indexErr) {
                        if (indexErr) return reject(indexErr);
                        console.log('MIGRATION 03_dedupe_keys_and_enforce_unique_index.js: unique key index ensured.');
                        resolve();
                    });
                };

                if (!idsToRemove.length) {
                    console.log('MIGRATION 03_dedupe_keys_and_enforce_unique_index.js: no duplicates found.');
                    return finalize();
                }

                nedb.remove({ _id: { $in: idsToRemove } }, { multi: true }, function (removeErr, numRemoved) {
                    if (removeErr) return reject(removeErr);
                    console.log(`MIGRATION 03_dedupe_keys_and_enforce_unique_index.js: removed ${numRemoved} duplicate entries.`);
                    return finalize();
                });
            });
        });
    }
};

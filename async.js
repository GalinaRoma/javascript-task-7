'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 * @returns {Promise}
 */
function runParallel(jobs, parallelNum, timeout = 1000) {
    return new Promise((resolve) => {
        if (jobs.length === 0) {
            resolve([]);
        }
        const results = [];
        let counterCalledFuncs = parallelNum;

        for (let i = 0; i < parallelNum; i++) {
            const job = jobs[i];

            callJob(job, i);
        }

        function callJob(job, jobIndex) {
            const funcToEmit = currentResult => callNextJob(currentResult, jobIndex);

            Promise.race([job(), new Promise((resolveForError) =>
                setTimeout(resolveForError, timeout, new Error('Promise timeout')))])
                .then(funcToEmit, funcToEmit);
        }

        function callNextJob(result, jobIndex) {
            results[jobIndex] = result;
            if (counterCalledFuncs < jobs.length) {
                const nextJobIndex = counterCalledFuncs;
                const job = jobs[counterCalledFuncs];

                callJob(job, nextJobIndex);
                counterCalledFuncs++;
            }
            if (results.length === jobs.length) {
                resolve(results);
            }
        }
    });
}

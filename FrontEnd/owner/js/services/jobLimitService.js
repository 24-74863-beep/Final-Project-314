// Service: maximum jobs per mechanic per day
(function (global) {
  'use strict';

  function niceDay(s) { return new Date(s + 'T00:00:00').toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }); }

  var JobLimit = {
    MAX_JOBS_PER_DAY: 5,

    // Number of jobs a mechanic has on a given day (YYYY-MM-DD).
    jobsOn: function (mechanicId, day, exceptRepairId) {
      return DB.all('repairs').filter(function (r) {
        return r.mechanicId === mechanicId && r.id !== exceptRepairId && DB.dayOf(r.createdAt) === day;
      }).length;
    },

    // Throws if the mechanic cannot take this job. `job` is the existing repair, or null for a new one.
    // A job already assigned to the mechanic can always be edited.
    assertCanTake: function (mechanicId, day, job) {
      var mm = DB.get('mechanics', mechanicId);
      if (!mm) throw new Error('The selected mechanic no longer exists.');
      if (job && job.mechanicId === mechanicId) return;
      if (JobLimit.jobsOn(mechanicId, day, job ? job.id : null) >= JobLimit.MAX_JOBS_PER_DAY)
        throw new Error(mm.name + ' already has ' + JobLimit.MAX_JOBS_PER_DAY + ' jobs on ' + niceDay(day) + '. Choose another mechanic.');
    }
  };

  global.JobLimit = JobLimit;
})(window);

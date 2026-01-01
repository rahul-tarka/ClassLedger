/**
 * ClassLedger by Tarka - Analytics & Insights Module
 * Version 2.0 Features
 */

/**
 * Calculate attendance trends
 */
function calculateTrends(attendanceData, days = 7) {
  const trends = {
    present: [],
    absent: [],
    late: [],
    dates: []
  };
  
  // Get last N days of data
  const sortedDates = Object.keys(attendanceData).sort().slice(-days);
  
  sortedDates.forEach(date => {
    const day = attendanceData[date];
    trends.dates.push(date);
    trends.present.push(day.present || 0);
    trends.absent.push(day.absent || 0);
    trends.late.push(day.late || 0);
  });
  
  // Calculate trend direction
  if (trends.present.length >= 2) {
    const recent = trends.present.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const previous = trends.present.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
    trends.direction = recent > previous ? 'up' : recent < previous ? 'down' : 'neutral';
    trends.change = ((recent - previous) / previous * 100).toFixed(1);
  }
  
  return trends;
}

/**
 * Detect anomalies in attendance
 */
function detectAnomalies(attendanceData, students) {
  const anomalies = [];
  
  // Check for sudden drops in attendance
  const dates = Object.keys(attendanceData).sort();
  if (dates.length >= 2) {
    const today = attendanceData[dates[dates.length - 1]];
    const yesterday = attendanceData[dates[dates.length - 2]];
    
    const todayRate = today.present / (today.present + today.absent);
    const yesterdayRate = yesterday.present / (yesterday.present + yesterday.absent);
    
    if (todayRate < yesterdayRate - 0.2) { // 20% drop
      anomalies.push({
        type: 'sudden_drop',
        severity: 'high',
        message: `Attendance dropped significantly: ${(yesterdayRate - todayRate) * 100}% decrease`,
        date: dates[dates.length - 1]
      });
    }
  }
  
  // Check for unusually high absence
  dates.forEach(date => {
    const day = attendanceData[date];
    const absenceRate = day.absent / (day.present + day.absent + day.late);
    if (absenceRate > 0.5) { // More than 50% absent
      anomalies.push({
        type: 'high_absence',
        severity: 'medium',
        message: `High absence rate on ${date}: ${(absenceRate * 100).toFixed(1)}%`,
        date: date
      });
    }
  });
  
  return anomalies;
}

/**
 * Calculate attendance statistics
 */
function calculateStats(attendanceData) {
  const stats = {
    totalDays: Object.keys(attendanceData).length,
    totalPresent: 0,
    totalAbsent: 0,
    totalLate: 0,
    averagePresent: 0,
    averageAbsent: 0,
    averageLate: 0,
    bestDay: null,
    worstDay: null
  };
  
  let bestRate = 0;
  let worstRate = 1;
  
  Object.keys(attendanceData).forEach(date => {
    const day = attendanceData[date];
    stats.totalPresent += day.present || 0;
    stats.totalAbsent += day.absent || 0;
    stats.totalLate += day.late || 0;
    
    const total = (day.present || 0) + (day.absent || 0) + (day.late || 0);
    if (total > 0) {
      const rate = (day.present || 0) / total;
      if (rate > bestRate) {
        bestRate = rate;
        stats.bestDay = { date, rate: (rate * 100).toFixed(1) + '%' };
      }
      if (rate < worstRate) {
        worstRate = rate;
        stats.worstDay = { date, rate: (rate * 100).toFixed(1) + '%' };
      }
    }
  });
  
  if (stats.totalDays > 0) {
    stats.averagePresent = (stats.totalPresent / stats.totalDays).toFixed(1);
    stats.averageAbsent = (stats.totalAbsent / stats.totalDays).toFixed(1);
    stats.averageLate = (stats.totalLate / stats.totalDays).toFixed(1);
  }
  
  return stats;
}

/**
 * Render analytics dashboard
 */
function renderAnalytics(attendanceData, students) {
  const trends = calculateTrends(attendanceData);
  const anomalies = detectAnomalies(attendanceData, students);
  const stats = calculateStats(attendanceData);
  
  return {
    trends,
    anomalies,
    stats
  };
}

/**
 * Export analytics report
 */
function exportAnalyticsReport(analytics, format = 'json') {
  if (format === 'json') {
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    Toast.success('Analytics report exported');
  }
}


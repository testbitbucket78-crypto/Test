var selectTemplate = `SELECT * FROM templateMessages WHERE spid=? and isDeleted !=1 and isTemplate=1`;

module.exports={selectTemplate}
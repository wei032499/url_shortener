module.exports = function (err) {
    if (err.hasOwnProperty('status') && err.hasOwnProperty('message'))
        return err;
    else if (err.hasOwnProperty('sqlState') && (err.sqlState === "HY000" || err.sqlState === '23000'))
        return { status: 400, message: "Bad Request" };
    else
        return { status: 500, message: "error" };
};
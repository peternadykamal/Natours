const mongoose = require("mongoose");

/**
 * used for custom validation, where it gets doc that we are validating from this object
 * as this object change based on the action that we are doing, it could be the document or the query object
 * in case of creation of a new document, this object will be the document
 * in case of update, this object will be the query object
 *
 * @param {Object|mongoose.Query} obj - The object or mongoose query to retrieve the document from.
 * @returns {Promise<Object>} The document for validation.
 */
const getDocForValidation = async function (obj) {
  if (obj instanceof mongoose.Query) {
    return await obj.model.findById(obj.getQuery()._id);
  }
  return obj;
};

/**
 *  used for custom validation, where it gets docs that we are validating from this object
 * as this object change based on the action that we are doing, it could be the document or the query object
 * in case of creation of a new document, this object will be the document
 * in case of update, this object will be the query object
 * @param {Object|mongoose.Query} obj - The object or mongoose query to retrieve the documents from.
 * @returns {Promise<Object>} The documents for validation.
 *
 */
const getDocsForValidation = async function (obj) {
  if (obj instanceof mongoose.Query) {
    return await obj.model.find(obj.getQuery());
  }
  return obj;
};

module.exports = { getDocForValidation, getDocsForValidation };

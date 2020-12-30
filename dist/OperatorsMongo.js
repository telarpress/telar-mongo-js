"use strict";
// Copyright (c) 2020 Amirhossein Movahedi (@qolzam)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperatorsMongo = void 0;
class OperatorsMongo {
    constructor() {
        /**
         * Applied operation to inject in database
         */
        this.operation = {};
    }
    /**
     * Get applied operation to inject in database
     */
    getOperation() {
        return this.operation;
    }
    /**
     * This operator handle plain object
     * @param data The data plain object
     */
    plain(data) {
        this.operation = Object.assign(Object.assign({}, this.operation), data);
        return this;
    }
    /**
     * The set operator replaces the value of a field with the specified value.
     * @param values Replace with field value
     */
    set(values) {
        this.operation = Object.assign(Object.assign({}, this.operation), { $set: values });
        return this;
    }
    /**
     * The in operator selects the documents where the value of a field equals any value in the specified array.
     * @param field The field of document
     * @param valueList List of value in the specified array to search
     */
    in(field, valueList) {
        this.operation = Object.assign(Object.assign({}, this.operation), { [field]: { $in: valueList } });
        return this;
    }
    /**
     * Performs a text search on the content of the fields indexed.
     * @param text The text value to search
     */
    search(text) {
        this.operation = Object.assign(Object.assign({}, this.operation), { $text: {
                $search: text,
            } });
        return this;
    }
    /**
     * The or operator performs a logical OR operation on an array of two or more <expressions> and selects the documents that satisfy at least one of the <expressions>
     * @param expressionList The list of expression to satisfy the query
     */
    or(expressionList) {
        this.operation = Object.assign(Object.assign({}, this.operation), { $or: expressionList });
        return this;
    }
    /**
     * Clear operation
     */
    clear() {
        this.operation = {};
        return this;
    }
}
exports.OperatorsMongo = OperatorsMongo;

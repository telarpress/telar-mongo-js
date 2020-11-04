// Copyright (c) 2020 Amirhossein Movahedi (@qolzam)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { data as coreData } from 'telar-core';

export class OperatorsMongo implements coreData.IOperators {
    /**
     * Applied operation to inject in database
     */
    private operation: Record<string, unknown> = {};
    /**
     * Get applied operation to inject in database
     */
    getOperation(): Record<string, unknown> {
        return this.operation;
    }
    /**
     * This operator handle plain object
     * @param data The data plain object
     */
    plain(data: Record<string, unknown>): coreData.IOperators {
        this.operation = { ...this.operation, ...data };
        return this;
    }
    /**
     * The set operator replaces the value of a field with the specified value.
     * @param values Replace with field value
     */
    set(values: Record<string, unknown>): coreData.IOperators {
        this.operation = { ...this.operation, $set: values };
        return this;
    }
    /**
     * The in operator selects the documents where the value of a field equals any value in the specified array.
     * @param field The field of document
     * @param valueList List of value in the specified array to search
     */
    in(field: string, valueList: (string | number)[]): coreData.IOperators {
        this.operation = { ...this.operation, [field]: { $in: valueList } };
        return this;
    }
    /**
     * Performs a text search on the content of the fields indexed.
     * @param text The text value to search
     */
    search(text: string): coreData.IOperators {
        this.operation = {
            ...this.operation,
            $text: {
                $search: text,
            },
        };
        return this;
    }
    /**
     * The or operator performs a logical OR operation on an array of two or more <expressions> and selects the documents that satisfy at least one of the <expressions>
     * @param expressionList The list of expression to satisfy the query
     */
    or(expressionList: Record<string, unknown>[]): coreData.IOperators {
        this.operation = { ...this.operation, $or: expressionList };
        return this;
    }
    /**
     * Clear operation
     */
    clear(): coreData.IOperators {
        this.operation = {};
        return this;
    }
}

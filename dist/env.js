"use strict";
// Copyright (c) 2020 Amirhossein Movahedi (@qolzam)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.envDBPass = void 0;
/**
 * For test suit
 */
exports.envDBPass = () => {
    const env = process.env.DB_PASS;
    return `${env}`;
};

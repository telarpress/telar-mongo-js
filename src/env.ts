// Copyright (c) 2020 Amirhossein Movahedi (@qolzam)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * For test suit
 */
export const envDBPass = (): string => {
    const env = process.env.DB_PASS;
    return `${env}`;
};

declare module '@telar/core/IServiceCollection' {
    /**
     * Constains extensions for configuring routing
     */
    interface IServiceCollection {
        /**
         * Add mongodb
         */
        addMongo(): IServiceCollection;
    }
}
export {};

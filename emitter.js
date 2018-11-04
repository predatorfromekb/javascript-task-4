'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
const isStar = true;

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    const events = new Map();

    function subscribe(namespace, context, handler, executeFunc = () => true) {
        if (!events.get(namespace)) {
            events.set(namespace, []);
        }
        events.get(namespace).push({
            handler: handler,
            context: context,
            executeFunc: executeFunc,
            counter: 0
        });
    }

    function unsubscribe(namespace, context) {
        const objects = events.get(namespace);
        if (!objects) {
            return;
        }
        events.set(namespace, objects.filter(e => e.context !== context));
    }

    function apply(namespace) {
        const objects = events.get(namespace);
        if (!objects) {
            return;
        }
        objects.forEach(object => {
            if (object.executeFunc()) {
                object.handler.call(object.context);
            }
            object.counter++;
        });
    }

    return {

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object} this
         */
        on: function (event, context, handler) {
            if (!event && !context && !handler) {
                return this;
            }

            subscribe(event, context, handler);
            console.info(event, context, handler);

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object} this
         */
        off: function (event, context) {
            if (!event && !context) {
                return this;
            }
            unsubscribe(event, context);
            events.forEach((array, namespace) => {
                if (namespace.indexOf(`${event}.`) === 0) {
                    unsubscribe(namespace, context);
                }
            });
            console.info(event, context);

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object} this
         */
        emit: function (event) {
            if (!event) {
                return this;
            }
            const parts = event.split('.');
            const namespaces = [];
            parts.forEach((value, index) => {
                namespaces.push(index === 0
                    ? value
                    : `${namespaces[index - 1]}.${value}`);
            });
            namespaces.reverse();

            namespaces.forEach(value => apply(value));

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object} this
         */
        several: function (event, context, handler, times) {
            if (!event && !context && !handler) {
                return this;
            }
            if (times <= 0) {
                return this.on(event, context, handler);
            }

            subscribe(event, context, handler, function () {
                return this.counter < times;
            });
            console.info(event, context, handler, times);

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object} this
         */
        through: function (event, context, handler, frequency) {
            if (!event && !context && !handler) {
                return this;
            }
            if (frequency <= 0) {
                return this.on(event, context, handler);
            }

            subscribe(event, context, handler, function () {
                return this.counter % frequency === 0;
            });
            console.info(event, context, handler, frequency);

            return this;
        }
    };
}

module.exports = {
    getEmitter,

    isStar
};

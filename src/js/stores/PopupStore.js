/*
 * stores/PopupStore.js
 */

import { EventEmitter } from 'events';
import { Events, Types } from '../constants/LinkBlankerConstants';
import AppDispatcher from '../dispatcher/AppDispatcher';
import Logger from '../libs/Logger';

const LinkBlanker = chrome.extension.getBackgroundPage().LinkBlanker;

const DISABLEDS = [ 'disabled-domain', 'disabled-directory', 'disabled-page', 'disabled-on' ];

const PreferenceStore = Object.assign({}, EventEmitter.prototype, {

  getAll: (callback) => {
    let data = LinkBlanker.getData();

    LinkBlanker.getCurrentData((error, result) => {
      if (error) {
        if (callback) {
          callback(error, null);
        }
        return;
      }

      Object.keys(data).forEach((k) => {
        let v = data[k];

        switch (k) {
          case 'disabled-domain':
          case 'disabled-directory':
          case 'disabled-page': {
            let item = LinkBlanker.preferenceValueFromId(k, result);

            if ('disabled-directory' === k) {
              let exist = false;

              for (let i = 0; i < v.length; i++) {
                if (item.match(new RegExp(`^${v[i]}.*$`))) {
                  exist = true;
                  break;
                }
              }

              data[k] = exist;
            } else {
              data[k] = (v.indexOf(item) > -1);
            }

            break;
          }
          case 'enabled-extension':
          case 'enabled-background-open':
          case 'enabled-multiclick-close':
          case 'disabled-same-domain':
          case 'disabled-on':
          case 'visible-link-state':
            data[k] = Boolean(v);
            break;
          default:
            data[k] = v;
            break;
        }
      });

      // build virtual fileld
      data['system-enabled-state'] = Boolean(LinkBlanker.isEnableFromUrl(result.url));
      data['disabled-state'] = 'disabled-off';

      DISABLEDS.forEach((value) => {
        if (data[value]) {
          data['disabled-state'] = value;
        }

        delete data[value];
      });

      if (callback) {
        callback(null, data);
      }
    });
  },

  emitChange: () => {
    PreferenceStore.emit(Events.CHANGE);
  },

  /**
   * @param {function} callback
   */
  addChangeListener: (callback) => {
    PreferenceStore.on(Events.CHANGE, callback);
  },

  /**
   * @param {function} callback
   */
  removeChangeListener: (callback) => {
    PreferenceStore.removeListener(Events.CHANGE, callback);
  }
});

AppDispatcher.register((action) => {
  switch(action.type) {
    case Types.SAVE: {
      let data = Object.assign({}, action.data);

      if (data['disabled-state']) {
        DISABLEDS.forEach((value) => {
          data[value] = (value === data['disabled-state']);
        });

        // delete virtual fileld
        delete data['disabled-state'];
      }

      LinkBlanker.setData(data, () => {
        PreferenceStore.emitChange();
      });

      break;
    }
  }
});

module.exports = PreferenceStore;
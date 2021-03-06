/*
 * actions/PreferenceAction.js
 */

import AppDispatcher from '../dispatcher/AppDispatcher';
import {Types} from '../constants/LinkBlankerConstants';

const PopupActions = {

  /**
   * Save Preference
   *
   * @param {string} key
   * @param {object} value
   */
  save(key, value) {
    let data = {};

    if ('object' === typeof key) {
      data = key;
    } else {
      data[key] = value;
    }

    AppDispatcher.dispatch({
      type: Types.SAVE,
      data: data,
    });
  },
};

module.exports = PopupActions;

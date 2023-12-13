/* eslint-disable indent */

// icons
import {icons} from '../../../../assets/scripts/icons.js';

// component
import Input from '../../../../components/Input.js';

// validations
import '../../../../utilities/validations.js';

const {
  isOverThan,
  isEmpty,
  isEmail
} = window;

/**
 * @function loginTemplate
 * @return {string} HTML string template of the login section
 */
export default function() {
  return /* html */`
    <div id='login' class='page' data-current-page='login'>

      <form data-action='' id='login-form' class='authentication-form'>
        <p id='login-form-title' class='authentication-form__title'>Welcome</p>
        <div class='authentication-form__inputs'>
          ${
            [
              new Input([isEmail, [isOverThan, 0, 255]], {
                flags: ['required'],
                attributes: {
                  name: 'email',
                  label: 'Email',
                  maxlength: 255
                }
              }),

              new Input([isEmpty], {
                flags: ['required'],
                attributes: {
                  name: 'password',
                  label: 'Password',
                  type: 'password',
                  maxlength: 255
                }
              })
            ].join('\n')
          }
        </div>

        <div id='login-form-bottom' class='authentication-form__bottom'>
          <p class='authentication-form__bottom__tag'>Login</p>
          <button id='login-button' class='authentication-form__submit'>
            ${ icons.arrowIcon('arrow') }
          </button>
        </div>

        <p id='forgot-password'>Forgot Password?</p>

      </form>

      <p id='to-register-prompt' class='bottom-prompt'>
        Don't have an account yet? Register and get verified
      </p>

    </div>
  `;
}

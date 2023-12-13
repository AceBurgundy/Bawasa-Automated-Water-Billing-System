/* eslint-disable indent */
// icons
import {icons} from '../../../../assets/scripts/icons.js';

// components
import Select from '../../../../components/Select.js';
import Input from '../../../../components/Input.js';

// validations
import '../../../../utilities/validations.js';

const {
  isBirthDate,
  isEmail,
  isEmpty,
  isValidPhoneNumber,
  notIn,
  isOverThan,
  userRelationshipTypes
} = window;

/**
 *
 * @function registerTemplate
 * @return {string} HTML string template of the register section
 */
export default function() {
  const userRelationshipValues = Object.values(userRelationshipTypes);

  const longestRelationshipOption = userRelationshipValues.reduce((first, next) =>
    next.length > first.length ? next : first
  ).length;

  const shortestRelationshipOption = userRelationshipValues.reduce((first, next) =>
    next.length < first.length ? next : first
  ).length;

  return /* html */`
    <div id='register' class='page' data-current-page='register'>

      <form data-action='' id='register-form' class='authentication-form'>
        <p id='register-form-title' class='authentication-form__title'>Create new account</p>
          <div class='authentication-form__inputs'>
            <div class='authentication-form__inputs-child'>
              ${
                [

                  new Input([isEmpty, [isOverThan, 2, 255]], {
                    flags: ['required'],
                    attributes: {
                      placeholder: 'First Name',
                      name: 'firstName',
                      maxlength: 255
                    }
                  }),

                  new Input([isEmpty, [isOverThan, 2, 255]], {
                    flags: ['required'],
                    attributes: {
                      placeholder: 'Middle Name',
                      name: 'middleName',
                      maxlength: 255
                    }
                  }),

                  new Input([isEmpty, [isOverThan, 2, 255]], {
                    flags: ['required'],
                    attributes: {
                      placeholder: 'Last Name',
                      name: 'lastName',
                      maxlength: 255
                    }
                  }),

                  new Input([isEmpty, isBirthDate], {
                    flags: ['required'],
                    attributes: {
                      placeholder: 'BirthDate',
                      name: 'birthDate',
                      type: 'date'
                    }
                  }),

                  new Input([isEmpty, [isOverThan, 15, 70]], {
                    flags: ['required'],
                    attributes: {
                      placeholder: 'Age',
                      type: 'number',
                      name: 'age'
                    }
                  })

                ].join('\n')
              }
            </div>
          <div class='authentication-form__inputs-child'>
            ${
              [

                new Select([
                  isEmpty,
                  [isOverThan, shortestRelationshipOption, longestRelationshipOption],
                  [notIn, [...Object.keys(window.userRelationshipTypes)]]
                ], {
                  options: window.userRelationshipTypes,
                  attributes: {
                    name: 'relationshipStatus'
                  },
                  flags: ['required']
                }),

                new Input([isValidPhoneNumber], {
                  flags: ['required'],
                  classes: ['number-input'],
                  attributes: {
                    placeholder: 'Phone Number',
                    name: 'phoneNumber',
                    type: 'number',
                    maxlength: 10
                  }
                }),

                new Input([isEmpty, isEmail, [isOverThan, 10, 255]], {
                  flags: ['required'],
                  attributes: {
                    placeholder: 'Email',
                    name: 'email',
                    type: 'email'
                  }
                }),

                new Input([isEmpty, [isOverThan, 10, 255]], {
                  flags: ['required'],
                  attributes: {
                    placeholder: 'Password',
                    name: 'password',
                    type: 'password'
                  }
                })

              ].join('\n')

            }
          </div>
        </div>
        <div id='register-form-bottom' class='authentication-form__bottom'>
          <p class='authentication-form__bottom__tag'>Register</p>
          <button id='register-button' class='authentication-form__submit'>
            ${ icons.arrowIcon('arrow') }
          </button>
        </div>
      </form>

      <p id='to-login-prompt' class='bottom-prompt'>
        Already Have an Account? Login instead
      </p>

    </div>
  `;
}

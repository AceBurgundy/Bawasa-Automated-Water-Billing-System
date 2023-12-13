/* eslint-disable indent */
/* eslint-disable max-len */
import {icons} from '../../../../assets/scripts/icons.js';

// components
import Select from '../../../../components/Select.js';
import Input from '../../../../components/Input.js';

// validations
import '../../../../utilities/validations.js';

// constants
import '../../../../utilities/constants.js';

const {
  userRelationshipTypes,
  isValidPhoneNumber,
  isBirthDate,
  isOverThan,
  isEmail,
  isEmpty,
  notIn
} = window;

/**
 * renders profile for the current user
 *
 * @function profileTemplate
 * @param {boolean} forEdit - True if the form will be used for editing profile data,
 * false otherwise.
 * @param {Object} user - The current user session data
 * @return {string} - the template for the profile
 */
export default function(forEdit, user) {
  const userRelationshipValues = Object.values(userRelationshipTypes);
  const longestRelationshipOption = userRelationshipValues.reduce((first, next) =>
    next.length > first.length ? next : first
  ).length;

  const shortestRelationshipOption = userRelationshipValues.reduce((first, next) =>
    next.length < first.length ? next : first
  ).length;

  const navigationObject = [
    {title: 'Clients', icon: icons.usersIcon('users-icon')},
    {title: 'Billing', icon: icons.billIcon('bill-icon')},
    {title: 'Logout', icon: icons.powerIcon('power-icon')}
  ];

  return /* html */`
    <section id='section-type-container' class='page user' data-current-page='profile'>

      <nav>
        <div id='nav-items'>
          ${navigationObject.map(navigation => {
              return /* html */`
                <div id='${navigation.title.toLowerCase()}' class='nav-item'>
                  <div>${navigation.icon}</div>
                  <p>${navigation.title}</p>
                </div>
              `;
            }).join('\n')
          }
        </div>
        <div id='profile' class='nav-item active'>
          <div>${icons.userIcon('user-icon')}</div>
          <p>Profile</p>
        </div>
      </nav>

      <section>

        <div id='user' class='content'>

          <div class='content__top'>
            <div>
                <img src='assets/images/Logo.png' alt=''>
                <p class='content__top-title'>BAWASA Automated Billing System</p>
            </div>
            <img src='assets/images/Logo.png' alt=''>
          </div>

          <form class='content__form content__center' id='user-form${forEdit ? '-edit' : ''}'>
            <p id='user-form-title'>Admin ${forEdit ? 'Edit Form' : user.fullName}</p>
            <div class='content__form-box'>
              <div class='content__form-box__group'>
                <div class='content__form-box__group__left'>
                  <div class='content__form-box__input-box'>
                    <p>Full Name</p>
                    <div class='content__form-box__input-box__inputs first-group'>
                      ${
                        [

                          new Input([isEmpty, [isOverThan, 2, 255]], {
                            flags: ['required'],
                            classes: [forEdit ? '' : 'input-readonly'],
                            attributes: {
                              label: 'First Name',
                              name: 'firstName',
                              value: user.firstName || ''
                            }
                          }),

                          new Input([isEmpty, [isOverThan, 2, 255]], {
                            flags: ['required'],
                            classes: [forEdit ? '' : 'input-readonly'],
                            attributes: {
                              label: 'Middle Name',
                              name: 'middleName',
                              value: user.middleName || ''
                            }
                          }),

                          new Input([isEmpty, [isOverThan, 2, 255]], {
                            flags: ['required'],
                            classes: [forEdit ? '' : 'input-readonly'],
                            attributes: {
                              label: 'Last Name',
                              name: 'lastName',
                              value: user.lastName || ''
                            }
                          }),

                          new Input([isEmpty, [isOverThan, 2, 255]], {
                            flags: ['required'],
                            classes: [forEdit ? '' : 'input-readonly'],
                            attributes: {
                              label: 'Extension',
                              name: 'extension',
                              value: user.extension || ''
                            }
                          })

                        ].join('\n')
                      }
                    </div>
                  </div>
                  <div class='content__form-box__input-box no-title'>
                    <div class='content__form-box__input-box__inputs'>
                      ${
                        new Select([
                          isEmpty,
                          [isOverThan, shortestRelationshipOption, longestRelationshipOption],
                          [notIn, [...Object.keys(userRelationshipTypes)]]
                        ], {
                          options: userRelationshipTypes,
                          flags: ['Required'],
                          classes: [forEdit ? '' : 'input-readonly'],
                          attributes: {
                            label: 'Relationship Status',
                            name: 'relationshipStatus',
                            selected: user?.relationshipStatus
                          }
                        })
                      }
                    </div>
                  </div>
                  <div class='content__form-box__input-box no-title'>
                    <div class='content__form-box__input-box__inputs'>
                      ${
                        [

                          new Input([isEmpty, isBirthDate], {
                            flags: ['required'],
                            classes: [forEdit ? '' : 'input-readonly'],
                            attributes: {
                              name: 'birthDate',
                              type: 'date',
                              label: 'BirthDate',
                              value: user.birthDate || ''
                            }
                          }),

                          new Input([isEmpty, [isOverThan, 15, 70]], {
                            flags: ['required'],
                            classes: [forEdit ? '' : 'input-readonly'],
                            attributes: {
                              name: 'age',
                              type: 'number',
                              label: 'Age',
                              value: user.age || ''
                            }
                          }),

                          new Input([isEmpty, isEmail, [isOverThan, 10, 255]], {
                            flags: ['required'],
                            classes: [forEdit ? '' : 'input-readonly'],
                            attributes: {
                              name: 'email',
                              type: 'email',
                              label: 'Email',
                              value: user.email || '',
                              minLength: 5
                            }
                          }),

                          new Input([isEmpty, isValidPhoneNumber], {
                            flags: ['required'],
                            classes: [forEdit ? '' : 'input-readonly', 'number-input'],
                            attributes: {
                              name: 'phoneNumber',
                              type: 'number',
                              label: 'Phone Number',
                              value: user.phoneNumbers[0] ? user.phoneNumbers[0].phoneNumber : '',
                              maxlength: '10'
                            }
                          })

                        ].join('\n')
                      }
                    </div>
                  </div>
                </div>
              </div>
              <div class='content__form-box__input-box'>
                <div id='duplicate-addresses-box'>
                  <p>Present Address</p>
                    ${forEdit ? `
                      <div>
                        <input type='checkbox' id='merge-addresses-checkbox'>
                        <p>Main Address the same as Present Address</p>
                      </div>
                    ` : ''}
                </div>
                <div class='content__form-box__input-box__inputs'>
                  ${
                    [

                      new Input([isEmpty, [isOverThan, 5, 255]], {
                        classes: [forEdit ? '' : 'input-readonly'],
                        attributes: {
                          name: 'presentAddressStreet',
                          label: 'Street',
                          value: user.presentAddress ? user.presentAddress.street : '',
                          maxLength: 255,
                          minLength: 5
                        }
                      }),

                      new Input([isEmpty, [isOverThan, 5, 255]], {
                        classes: [forEdit ? '' : 'input-readonly'],
                        attributes: {
                          name: 'presentAddressSubdivision',
                          label: 'Subdivision',
                          value: user.presentAddress ? user.presentAddress.subdivision : '',
                          maxLength: 255,
                          minLength: 5
                        }
                      }),

                      new Input([isEmpty, [isOverThan, 5, 255]], {
                        flags: ['required'],
                        classes: [forEdit ? '' : 'input-readonly'],
                        attributes: {
                          name: 'presentAddressBarangay',
                          label: 'Barangay',
                          value: user.presentAddress ? user.presentAddress.barangay : '',
                          maxLength: 255,
                          minLength: 5
                        }
                      }),

                      new Input([isEmpty, [isOverThan, 5, 255]], {
                        flags: ['required'],
                        classes: [forEdit ? '' : 'input-readonly'],
                        attributes: {
                          name: 'presentAddressCity',
                          label: 'City',
                          value: user.presentAddress ? user.presentAddress.city : '',
                          maxLength: 255,
                          minLength: 5
                        }
                      }),

                      new Input([isEmpty, [isOverThan, 5, 255]], {
                        flags: ['required'],
                        classes: [forEdit ? '' : 'input-readonly'],
                        attributes: {
                          name: 'presentAddressProvince',
                          label: 'Province',
                          value: user.presentAddress ? user.presentAddress.province : '',
                          maxLength: 255,
                          minLength: 10
                        }
                      }),

                      new Input([isEmpty, [isOverThan, 4, 9999]], {
                        flags: ['required'],
                        classes: [forEdit ? '' : 'input-readonly'],
                        attributes: {
                          name: 'presentAddressPostalCode',
                          label: 'Postal Code',
                          type: 'number',
                          value: user.presentAddress ? user.presentAddress.postalCode : '',
                          maxlength: 4,
                          minLength: 4
                        }
                      }),

                      new Input([isEmpty, [isOverThan, 5, 255]], {
                        flags: ['required'],
                        classes: [forEdit ? '' : 'input-readonly'],
                        attributes: {
                          name: 'presentAddressDetails',
                          label: 'Details',
                          value: user.presentAddress ? user.presentAddress.details : '',
                          maxLength: 255,
                          minLength: 20
                        }
                      })

                    ].join('\n')
                  }

                </div>
              </div>
              <div class='content__form-box__input-box'>
                <p>Main Address</p>
                <div class='content__form-box__input-box__inputs'>
                  ${
                    [

                      new Input([isEmpty, [isOverThan, 5, 255]], {
                        classes: [forEdit ? '' : 'input-readonly'],
                        attributes: {
                          name: 'mainAddressStreet',
                          label: 'Street',
                          value: user.mainAddress ? user.mainAddress.street : '',
                          maxlength: 50,
                          minLength: 5
                        }
                      }),

                      new Input([isEmpty, [isOverThan, 5, 255]], {
                        classes: [forEdit ? '' : 'input-readonly'],
                        attributes: {
                          name: 'mainAddressSubdivision',
                          label: 'Subdivision',
                          value: user.mainAddress ? user.mainAddress.subdivision : '',
                          maxlength: 50,
                          minLength: 5
                        }
                      }),

                      new Input([isEmpty, [isOverThan, 5, 255]], {
                        flags: ['required'],
                        classes: [forEdit ? '' : 'input-readonly'],
                        attributes: {
                          name: 'mainAddressBarangay',
                          label: 'Barangay',
                          value: user.mainAddress ? user.mainAddress.barangay : '',
                          maxlength: 50,
                          minLength: 5
                        }
                      }),

                      new Input([isEmpty, [isOverThan, 5, 255]], {
                        flags: ['required'],
                        classes: [forEdit ? '' : 'input-readonly'],
                        attributes: {
                          name: 'mainAddressCity',
                          label: 'City',
                          value: user.mainAddress ? user.mainAddress.city : '',
                          maxlength: 50,
                          minLength: 5
                        }
                      }),

                      new Input([isEmpty, [isOverThan, 5, 255]], {
                        flags: ['required'],
                        classes: [forEdit ? '' : 'input-readonly'],
                        attributes: {
                          name: 'mainAddressProvince',
                          label: 'Province',
                          value: user.mainAddress ? user.mainAddress.province : '',
                          maxlength: 50,
                          minLength: 10
                        }
                      }),

                      new Input([isEmpty, [isOverThan, 4, 9999]], {
                        flags: ['required'],
                        classes: [forEdit ? '' : 'input-readonly'],
                        attributes: {
                          name: 'mainAddressPostalCode',
                          label: 'Postal Code',
                          type: 'number',
                          value: user.mainAddress ? user.mainAddress.postalCode : '',
                          maxlength: 4,
                          minLength: 4
                        }
                      }),

                      new Input([isEmpty, [isOverThan, 5, 255]], {
                        flags: ['required'],
                        classes: [forEdit ? '' : 'input-readonly'],
                        attributes: {
                          name: 'mainAddressDetails',
                          label: 'Details',
                          value: user.mainAddress ? user.mainAddress.details : '',
                          maxLength: 255,
                          minLength: 20
                        }
                      })

                    ].join('\n')
                  }

                </div>
              </div>
              <div class='content__form-box__input last'>
                <button class='button-primary' id='user-register-submit-button'>
                  ${forEdit ? 'Save' : 'Edit'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </section>
  `;
}

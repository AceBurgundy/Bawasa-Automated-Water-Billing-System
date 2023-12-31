/* eslint-disable max-len */
/* eslint-disable indent */
import {getSampleForm} from '../main/random-form-filler.js';

// icons
import {icons} from '../../../../assets/scripts/icons.js';

// components
import Select from '../../../../components/Select.js';
import Input from '../../../../components/Input.js';

// validations
import '../../../../utilities/validations.js';

// constants
import '../../../../utilities/constants.js';

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
 * @function clientBuilderTemplate
 * @param {boolean} forEdit - true if used for editing client data, false otherwise.
 * @param {Object} clientData - Client data object
 * @return {string} template for client builder
 */
export default function(forEdit, clientData) {
  const userRelationshipValues = Object.values(userRelationshipTypes);

  const longestRelationshipOption = userRelationshipValues.reduce((first, next) =>
    next.length > first.length ? next : first
  ).length;

  const shortestRelationshipOption = userRelationshipValues.reduce((first, next) =>
    next.length < first.length ? next : first
  ).length;

  /**
   * uncomment this code and comment this other one,
   * if you want to use sampel data in the client form
   */
  const sample = getSampleForm();

  /**
   * Sample explanation for each input values
   * forEdit ? clientData.firstName : sample?.firstName ?? ''
   *
   * This means that;
   *
   * if the form is used for editing client data (forEdit = true),
   *  use the clients first name (clientData.firstName)
   *
   * else, if sample is not null (sample?)
   *  use a firstName generated from sample (sample?.firstName)
   *
   * else, if sample is null or sample.firstName is null
   *  use an empty string ('')
   *
   */
  // const sample = null;

  const navigationObject = [
      {title: 'Clients', icon: icons.usersIcon('users-icon')},
      {title: 'Billing', icon: icons.billIcon('bill-icon')},
      {title: 'Logout', icon: icons.powerIcon('power-icon')}
  ];

  const addressType = {
    MAIN: 'mainAddress',
    PRESENT: 'presentAddress'
  };

  /**
   * returns a value from `clientData` or `sample` based on the provided
   * `key` and `address`.
   * @param {string} key - represents the key of the value you want to
   * retrieve from the `clientData` or `sample` object.
   * @param {addressType} [address=null] - used to specify the type of address for which the
   * value is being provided. It can have one of the following values: addressType.MAIN or addressType.PRESENT
   * @param {boolean} forPhoneNumber - true or false on whether you're trying to query value for a phone number.
   * @return {string} The function `provideValue` returns the value of `clientData[address][key]` if `forEdit` is
   * true and `address` is either `addressType.MAIN` or `addressType.PRESENT` and `clientData[address]`
   * exists. If the value is not found, it returns an empty string. If `forEdit` is false, it returns the
   * value
   */
  function provideValue(key, address = null, forPhoneNumber=false) {
    if (forEdit) {
      const forMainAddress = address === addressType.MAIN;
      const forPresentAddress = address === addressType.PRESENT;
      const forAnAddress = forMainAddress || forPresentAddress;

      if (forPhoneNumber && clientData.phoneNumbers.length > 0) {
        return clientData.phoneNumbers[0].phoneNumber;
      }

      if (forAnAddress && clientData[address]) {
        console.log(`clientData[${address}][${key}]: `, clientData[address][key]);
        return clientData[address][key] ?? '';
      }

      const data = clientData[key];
      if (data) return data;

      console.error(`Did not found client data for ${key}`);
      return '';
    }

    if (sample && sample[key]) {
      return sample[key];
    }

    console.error(`Did not found sample data for ${key}`);
    return '';
  };

  return /* html */`
    <section id='section-type-container' class='page client' data-current-page='clientBuilder'>

      <nav>
        <div id='nav-items'>
          ${
            navigationObject.map(navigation => {
              return /* html */`
                <div id='${navigation.title.toLowerCase()}' class='nav-item'>
                  <div>${navigation.icon}</div>
                  <p>${navigation.title}</p>
                </div>
              `;
            }).join('\n')
          }
        </div>
        <div id='profile' class='nav-item'>
          <div>${icons.userIcon('user-icon')}</div>
          <p>Profile</p>
        </div>
      </nav>

      <section>

        <div id='client' class='content'>

          <div class='content__top'>
            <div>
                <img src='../static/images/Logo.png' alt=''>
                <p class='content__top-title'>BAWASA Automated Billing System</p>
            </div>
            <img src='../static/images/Logo.png' alt=''>
          </div>

          <form class='content__form content__center' id='client-form'>
            <p id='new-client-form-title'>Client ${forEdit ? 'Edit' : 'Registration'} Form</p>
              <div class='content__form-box'>
                <div class='content__form-box__group'>
                  <div class='content__form-box__group__left'>
                    <div class='content__form-box__input-box'>
                      <p>Full Name</p>
                      <div class='content__form-box__input-box__inputs first-group'>
                        ${
                          [

                            new Input([isEmpty, [isOverThan, 2, 255]], {
                              attributes: {
                                label: 'First Name',
                                name: 'firstName',
                                value: provideValue('firstName')
                              },
                              flags: ['required']
                            }),

                            new Input([isEmpty, [isOverThan, 2, 255]], {
                              attributes: {
                                label: 'Middle Name',
                                name: 'middleName',
                                value: provideValue('middleName')
                              },
                              flags: ['required']
                            }),

                            new Input([isEmpty, [isOverThan, 2, 255]], {
                              attributes: {
                                label: 'Last Name',
                                name: 'lastName',
                                value: provideValue('lastName')
                              },
                              flags: ['required']
                            }),

                            new Input([isEmpty, [isOverThan, 2, 255]], {
                              attributes: {
                                label: 'Extension',
                                name: 'extension',
                                value: provideValue('extension')
                              },
                                flags: ['required']
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
                              attributes: {
                                label: 'Relationship Status',
                                name: 'relationshipStatus',
                                selected: provideValue('relationshipStatus')
                              },
                              classes: ['input-style'],
                              flags: ['Required']
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
                              attributes: {
                                name: 'birthDate',
                                type: 'date',
                                label: 'BirthDate',
                                value: provideValue('birthDate')
                              }
                            }),

                            new Input([isEmpty, [isOverThan, 15, 70]], {
                              flags: ['required'],
                              attributes: {
                                name: 'age',
                                type: 'number',
                                label: 'Age',
                                value: provideValue('age')
                              }
                            }),

                            new Input([isEmpty, isEmail, [isOverThan, 10, 255]], {
                              flags: ['required'],
                              attributes: {
                                name: 'email',
                                type: 'email',
                                label: 'Email',
                                value: provideValue('email'),
                                minLength: 5
                              }
                            }),

                            new Input([isEmpty, [isOverThan, 2, 255]], {
                              flags: ['required'],
                              attributes: {
                                name: 'occupation',
                                label: 'Occupation',
                                value: provideValue('occupation'),
                                minLength: 2,
                                maxLength: 100
                              }
                            }),

                            // new Input([], {
                            //   flags: ['required'],
                            //   attributes: {
                            //     name: 'meterNumber',
                            //     label: 'Meter Number',
                            //     value: provideValue('meterNumber')
                            //   }
                            // }),

                            new Input([isEmpty, isValidPhoneNumber], {
                              flags: ['required'],
                              classes: ['number-input'],
                              attributes: {
                                name: 'phoneNumber',
                                type: 'number',
                                label: 'Phone Number',
                                value: provideValue('phoneNumber', null, true),
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
                      <div>
                          <input type='checkbox' id='mergePresentAndMainPrompt'>
                          <p>Main Address the same as Present Address</p>
                      </div>
                  </div>
                  <div class='content__form-box__input-box__inputs'>
                    ${
                      [

                        new Input([isEmpty, [isOverThan, 5, 255]], {
                          attributes: {
                            name: 'presentAddressStreet',
                            label: 'Street',
                            value: provideValue('street', addressType.PRESENT),
                            maxLength: 255,
                            minLength: 5
                          }
                        }),

                        new Input([], {
                          attributes: {
                            name: 'presentAddressRegion',
                            label: 'Region',
                            value: '',
                            maxLength: 255,
                            minLength: 2
                          }
                        }),

                        new Input([isEmpty, [isOverThan, 5, 255]], {
                          flags: ['required'],
                          attributes: {
                            name: 'presentAddressBarangay',
                            label: 'Barangay',
                            value: provideValue('barangay', addressType.PRESENT),
                            maxLength: 255,
                            minLength: 5
                          }
                        }),

                        new Input([isEmpty, [isOverThan, 5, 255]], {
                          flags: ['required'],
                          attributes: {
                            name: 'presentAddressCity',
                            label: 'City',
                            value: provideValue('city', addressType.PRESENT),
                            maxLength: 255,
                            minLength: 5
                          }
                        }),

                        new Input([isEmpty, [isOverThan, 4, 9999]], {
                          flags: ['required'],
                          attributes: {
                            name: 'presentAddressPostalCode',
                            label: 'Postal Code',
                            type: 'number',
                            value: provideValue('postalCode', addressType.PRESENT),
                            maxlength: 4,
                            minLength: 4
                          }
                        }),

                        new Input([isEmpty, [isOverThan, 5, 255]], {
                          flags: ['required'],
                          attributes: {
                            name: 'presentAddressDetails',
                            label: 'Details',
                            value: provideValue('details', addressType.PRESENT),
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
                          attributes: {
                            name: 'mainAddressStreet',
                            label: 'Street',
                            value: provideValue('street', addressType.MAIN),
                            maxlength: 50,
                            minLength: 5
                          }
                        }),

                        new Input([], {
                          attributes: {
                            name: 'mainAddressRegion',
                            label: 'Region',
                            value: '',
                            maxlength: 255,
                            minLength: 2
                           }
                        }),

                        new Input([isEmpty, [isOverThan, 5, 255]], {
                          flags: ['required'],
                          attributes: {
                            name: 'mainAddressBarangay',
                            label: 'Barangay',
                            value: provideValue('barangay', addressType.MAIN),
                            maxlength: 50,
                            minLength: 5
                          }
                        }),

                        new Input([isEmpty, [isOverThan, 5, 255]], {
                          flags: ['required'],
                          attributes: {
                            name: 'mainAddressCity',
                            label: 'City',
                            value: provideValue('city', addressType.MAIN),
                            maxlength: 50,
                            minLength: 5
                          }
                        }),

                        new Input([isEmpty, [isOverThan, 4, 9999]], {
                          flags: ['required'],
                          attributes: {
                            name: 'mainAddressPostalCode',
                            label: 'Postal Code',
                            type: 'number',
                            value: provideValue('postalCode', addressType.MAIN),
                            maxlength: 4,
                            minLength: 4
                          }
                        }),

                        new Input([isEmpty, [isOverThan, 5, 255]], {
                          flags: ['required'],
                          attributes: {
                            name: 'mainAddressDetails',
                            label: 'Details',
                            value: provideValue('details', addressType.MAIN),
                            maxLength: 255,
                            minLength: 20
                          }
                         })

                      ].join('\n')
                    }
                  </div>
                </div>
                <div class='content__form-box__input-box files'></div>
                <div class='content__form-box__input last'>
                  <button class='button-primary' id='client-register-submit-button'>
                    ${forEdit ? clientData && 'Edit' : 'Create'}
                  </button>
                </div>
              </div>
            </form>

          </div>

        </div>

      </section>

    </section>
  `;
}

import '../../../../utilities/constants.js';

const firstName = [
  'John',
  'Alice',
  'Michael',
  'Emily',
  'David',
  'Sarah',
  'Robert',
  'Olivia',
  'William',
  'Sophia'];

const middleName = [
  'Robert',
  'Grace',
  'James',
  'Marie',
  'Paul',
  'Elizabeth',
  'David',
  'Linda',
  'Daniel',
  'Emma'];

const lastName = [
  'Smith',
  'Johnson',
  'Brown',
  'Davis',
  'Miller',
  'Wilson',
  'Anderson',
  'Jones',
  'Clark',
  'Martinez'];

const extension = [
  'JR',
  'SR',
  '1st',
  '2nd'
];

const relationshipStatus = [...Object.keys(window.userRelationshipTypes)];

const birthDate = [
  '1990-05-15',
  '1985-09-22',
  '1992-11-10',
  '1988-03-07',
  '1995-12-30',
  '1993-06-18',
  '1980-04-25',
  '1987-08-12',
  '1999-01-03',
  '1996-10-20'
];

const age = [32, 37, 29, 34, 26, 28, 41, 34, 24, 27];

const email = [
  'john@example.com',
  'alice@example.com',
  'michael@example.com',
  'emily@example.com',
  'david@example.com',
  'sarah@example.com',
  'robert@example.com',
  'olivia@example.com',
  'william@example.com',
  'sophia@example.com'
];

const occupation = [
  'Engineer',
  'Teacher',
  'Doctor',
  'Lawyer',
  'Artist',
  'Nurse',
  'Software Developer',
  'Accountant',
  'Chef',
  'Dentist'
];

const phoneNumber = [
  '9951234567',
  '9959876543',
  '9954567890',
  '9957891234',
  '9952345678',
  '9958901234',
  '9954567890',
  '9951237890',
  '9957890123',
  '9952345678'
];

const meterNumber = [
  'WM12345',
  'WM56789',
  'WM23456',
  'WM98765',
  'WM34567',
  'WM87654',
  'WM43210',
  'WM65432',
  'WM21098',
  'WM78901'
];

const postalCode = ['1234', '5678', '2345', '9876', '3456', '8765', '4321', '6543', '2109', '7890'];

const street = [
  '123 Main St',
  '456 Elm St',
  '789 Oak St',
  '321 Maple St',
  '654 Pine St',
  '987 Cedar St',
  '234 Birch St',
  '876 Willow St',
  '543 Redwood St',
  '678 Spruce St'
];

const subdivision = [
  'Sunnydale',
  'Riverdale',
  'Hillside',
  'Meadowbrook',
  'Lakeview',
  'Woodland',
  'Brookside',
  'Highland',
  'Valleyview',
  'Riverside'
];

const barangay = [
  'Central',
  'Westside',
  'East End',
  'Northside',
  'South End',
  'Downtown',
  'Uptown',
  'Midtown',
  'Old Town',
  'New Town'
];

const city = [
  'Cityville',
  'Townsville',
  'Villagetown',
  'Metropolis',
  'Hamletville',
  'Suburbia',
  'Capital City',
  'Coastal Town',
  'Mountainview',
  'Harbor City'
];

const province = [
  'State A',
  'State B',
  'State C',
  'State D',
  'State E',
  'State F',
  'State G',
  'State H',
  'State I',
  'State J'
];

const details = [
  'Blue House, Wrought Iron Gate',
  'Yellow House, Wooden Gate',
  'White House, Brick Arch Gate',
  'Green House, Picket Fence Gate',
  'Red House, Stone Pillar Gate',
  'Gray House, Metal Sliding Gate',
  'Brown House, Bamboo Gate',
  'Orange House, Iron Mesh Gate',
  'Pink House, Vine-Covered Gate',
  'Purple House, Glass Panel Gate'
];

const getRandomElement = array => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

export const getSampleForm = () => {
  return {
    firstName: getRandomElement(firstName),
    middleName: getRandomElement(middleName),
    lastName: getRandomElement(lastName),
    extension: getRandomElement(extension),
    relationshipStatus: getRandomElement(relationshipStatus),
    birthDate: getRandomElement(birthDate),
    age: getRandomElement(age),
    email: getRandomElement(email),
    occupation: getRandomElement(occupation),
    phoneNumber: getRandomElement(phoneNumber),
    meterNumber: getRandomElement(meterNumber),
    postalCode: getRandomElement(postalCode),
    street: getRandomElement(street),
    subdivision: getRandomElement(subdivision),
    barangay: getRandomElement(barangay),
    city: getRandomElement(city),
    province: getRandomElement(province),
    details: getRandomElement(details)
  };
};

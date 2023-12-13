/* eslint-disable linebreak-style */
module.exports = {
  packagerConfig: {
    asar: true,
    icon: './source/assets/images/Logo.png'
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        iconUrl: 'https://drive.google.com/uc?export=download&id=11MSw42Soj7puz7jhhQkwEGLfx9uGveIH',
        setupIcon: './source/assets/images/Logo.ico'
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        icon: './source/assets/images/Logo.png'
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        icon: './source/assets/images/Logo.png'
      }
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {}
    }
  ]
};

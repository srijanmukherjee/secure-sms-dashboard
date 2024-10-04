module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'react-hooks/exhaustive-deps': [
      'error',
      {
        additionalHooks: 'useCustomHook',
      },
    ],
  },
};

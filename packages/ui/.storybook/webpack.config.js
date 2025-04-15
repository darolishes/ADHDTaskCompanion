module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.css$/,
    use: [
      {
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            plugins: [
              require('tailwindcss')('./tailwind.config.js'),
              require('autoprefixer'),
            ],
          },
        },
      },
    ],
  });

  return config;
};

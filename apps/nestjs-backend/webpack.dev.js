const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const glob = require('glob');
const nodeExternals = require('webpack-node-externals');

module.exports = function (options, webpack) {
  const workerFiles = glob.sync(path.join(__dirname, 'src/worker/**.ts'));
  const workerEntries = workerFiles.reduce((acc, file) => {
    const relativePath = path.relative(path.join(__dirname, 'src/worker'), file);
    const entryName = `worker/${path.dirname(relativePath)}/${path.basename(relativePath, '.ts')}`;
    acc[entryName] = file;
    return acc;
  }, {});
  return {
    ...options,
    entry: {
      index: ['webpack/hot/poll?100', options.entry],
      ...workerEntries,
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: '[name].js',
    },
    mode: 'development',
    devtool: 'source-map',
    externals: [
      nodeExternals({
        allowlist: ['webpack/hot/poll?100', /^@teable/],
      }),
    ],
    watchOptions: {
      ignored: ['**/test/**', '**/*.spec.ts', '**/node_modules/**', '**/i18n.generated.ts'],
      poll: 1000,
    },
    module: {
      rules: [
        {
          test: /\.ts?$/,
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            happyPackMode: true,
          },
          exclude: [/node_modules/, /.e2e-spec.ts$/],
        },
      ],
    },
    cache: {
      type: 'filesystem',
      allowCollectingMemory: true,
      buildDependencies: {
        config: [__filename],
      },
    },
    plugins: [
      ...options.plugins.filter(
        (plugin) => plugin.constructor?.name !== 'ForkTsCheckerWebpackPlugin'
      ),
      new webpack.HotModuleReplacementPlugin(),
      new CopyPlugin({
        patterns: [{ from: 'src/features/mail-sender/templates', to: 'templates' }],
      }),
    ],
  };
};

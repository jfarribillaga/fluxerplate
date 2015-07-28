import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserify from 'browserify';
import del from 'del';
import mkdirp from 'mkdirp';
import sass from 'gulp-ruby-sass';
import browserSync from 'browser-sync';
import cp from 'child_process';
import webpack from 'webpack';

import minimist from 'minimist';
const argv = minimist(process.argv.slice(2));

import runSequence from 'run-sequence';

const $ = gulpLoadPlugins();

let watch = false;
let initConfig = {
    src: {
      path: './app',
      assetsDir: './app/assets/',
      styles: './app/styles/'
    },
    dest: {
      path: '.dist/',
      assetsDir: './dist/assets/',
      styles: './dist/styles/'
    },
  server: {
    kickoff: './server/index.js'
  }

};

function runCommand(command) {
  let exec = cp.exec;
  return function (cb) {
    exec(command, function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  };
}

gulp.task('clean', callback => {
  del(['dist/*'], {dot: true}, () => {
    mkdirp(initConfig.dest.assetsDir, callback);
  });
});

gulp.task('assets', () => {
  return gulp.src(initConfig.src.assetsDir + '**')
    .pipe($.changed(initConfig.dest.assetsDir))
    .pipe($.size({showFiles: true, title: '[assets]'}))
    .pipe(gulp.dest(initConfig.dest.assetsDir));
});

gulp.task('sass', () => {
  function sassStream() {
    let options = {
      sourcemap: true,
      stopOnError: true,
      lineNumbers: false
    };

    return sass(initConfig.src.styles, options)
      .on('error', err => {
        console.error('[Error]: ', err.message);
      })
      .pipe($.sourcemaps.write('./'), {
        includeContent: false,
        sourceRoot: initConfig.src.styles
      });
  }
  return sassStream()
    .pipe(gulp.dest(initConfig.dest.styles))
    .pipe($.filter('**/*.css'))
    .pipe(browserSync.reload({stream: true}));
});

// Bundle
gulp.task('bundle', cb => {
  const config = require('./config/webpack.config.js');
  const bundler = webpack(config);
  const verbose = argv.verbose || false;
  let bundlerRunCount = 0;

  function bundle(err, stats) {
    if (err) {
      throw new $.util.PluginError('webpack', err);
    }

    console.log(stats.toString({
      colors: $.util.colors.supportsColor,
      hash: verbose,
      version: verbose,
      timings: verbose,
      chunks: verbose,
      chunkModules: verbose,
      cached: verbose,
      cachedAssets: verbose
    }));

    if (++bundlerRunCount === (watch ? config.length : 1)) {
      return cb();
    }
  }

  if (watch) {
    bundler.watch(200, bundle);
  } else {
    bundler.run(bundle);
  }
});

// Build and start watching for modifications
gulp.task('build:watch', cb => {
  watch = true;
  runSequence('sass', 'build', () => {
    gulp.watch(initConfig.src.assetsDir, ['assets']);
    gulp.watch(initConfig.src.styles + '**/*.scss', ['sass']);
    cb();
  });
});

//Client app - development runner.
gulp.task('client', ['build:watch'], cb => {
  browserSync.init(null, {
    logLevel: 'debug',
    notify: false,
    host: '0.0.0.0',
    server: {
      baseDir: './dist'
    }
  }, cb);
  gulp.watch('./app/*.html').on('change', () => {
    browserSync.reload();
  });
  process.on('exit', () => {
    runSequence('stop-mongo', () => browserSync.exit());
  });
});

//Server app - development runner.
gulp.task('server', cb => {
  let started = false;
  runSequence('start-mongo');
  let server = (function startup(){
    const child = cp.fork(initConfig.server.kickoff, {
      env: Object.assign({NODE_ENV: 'development'}, process.env)
    });
    child.once('message', message => {
      if (message.match(/^online$/)) {
        if (browserSync) {
          browserSync.reload();
        }
        if (!started) {
          started = true;
          gulp.watch('./server/**/*.js', function() {
            $.util.log('Restarting development server.');
            server.kill('SIGTERM');
            server = startup();
          });
          cb();
        }
      }
    });
    return child;
  })();
  process.on('exit', () => server.kill('SIGTERM'));
});

// Build the app from source code
gulp.task('build', ['clean'], cb => {
  runSequence(['assets', 'sass'], ['bundle'], cb);
});

gulp.task('serve', ['server', 'client']);

gulp.task('start-mongo', runCommand('mongod'));

gulp.task('stop-mongo', runCommand('mongo admin --eval "db.shutdownServer()"'));

gulp.task('default', ['serve']);

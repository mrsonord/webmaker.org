module.exports = function (grunt) {
  require('time-grunt')(grunt);
  require('jit-grunt')(grunt, {
    shell: 'grunt-shell-spawn',
    express: 'grunt-express-server',
    gettext_finder: 'grunt-gettext-finder'
  });

  // Node and client side JS have slightly different JSHint directives
  // We'll create 2 versions with .jshintrc as a baseline
  var browserJSHint = grunt.file.readJSON('.jshintrc');
  var nodeJSHint = grunt.file.readJSON('.jshintrc');

  // Don't throw errors for expected Node globals
  nodeJSHint.node = true;

  // Don't throw errors for expected browser globals
  browserJSHint.browser = true;

  var clientSideJS = [
    'public/js/**/*.js',
    '!public/js/lib/**'
  ];

  var nodeJS = [
    'Gruntfile.js',
    'app.js',
    'lib/**/*.js',
    'routes/**/*.js',
    'test/**/*.js'
  ];

  var allJS = clientSideJS.concat(nodeJS);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jsbeautifier: {
      modify: {
        src: allJS,
        options: {
          config: '.jsbeautifyrc'
        }
      },
      verify: {
        src: allJS,
        options: {
          mode: 'VERIFY_ONLY',
          config: '.jsbeautifyrc'
        }
      }
    },
    jshint: {
      browser: {
        src: clientSideJS,
        options: browserJSHint
      },
      node: {
        src: nodeJS,
        options: nodeJSHint
      }
    },
    gettext_finder: {
      files: ["views/*.html", "views/**/*.html"],
      options: {
        pathToJSON: ["locale/en_US/*.json"],
        ignoreKeys: grunt.file.readJSON("gtf-ignored-keys.json")
      },
    },
    imagemin: {
      options: {
        optimizationLevel: 7,
        pngquant: false
      },
      primary: {
        files: [{
          expand: true,
          cwd: "public/img/",
          src: ["**/*.{png,jpg,gif}"],
          dest: "public/img/"
        }]
      }
    },
    uglify: {
      dependencies: {
        options: {
          sourceMap: true,
          beautify: true,
          mangle: false
        },
        files: {
          'public/compiled/dependencies.min.js': [
            'bower_components/jquery/jquery.js',
            'bower_components/web-literacy-client/dist/web-literacy-client.with-langs.js',
            'bower_components/makeapi-client/src/make-api.js',
            'bower_components/webmaker-auth-client/dist/webmaker-auth-client.min.js',
            'bower_components/selectize/dist/js/standalone/selectize.js',
            'bower_components/webmaker-analytics/analytics.js',

            'bower_components/angular/angular.js',
            'bower_components/angular-bootstrap/ui-bootstrap.js',
            'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            'bower_components/ngScrollSpy/dist/ngScrollSpy.js',
            'bower_components/angular-resource/angular-resource.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/angular-sanitize/angular-sanitize.js',
            'bower_components/moment/min/moment+langs.min.js',
            'bower_components/angular-moment/angular-moment.min.js'
          ],
        },
      },
      app: {
        options: {
          sourceMap: true,
          beautify: true,
          mangle: false
        },
        files: {
          'public/compiled/app.min.js': ['public/js/angular/**/*.js', 'lib/badges-permissions-model.js']
        },
      },
    },

    watch: {
      angular: {
        files: ['public/js/angular/**/*.js', 'lib/badges-permissions-model.js'],
        tasks: ['uglify:app'],
        options: {
          spawn: false
        }
      },
      node: {
        files: ['routes/**/*.js', 'lib/**/*.js', 'app.js', 'less/**/*', 'locale/**/*.json', 'views/**/*.html'],
        tasks: ['express:dev'],
        options: {
          spawn: false
        }
      }
    },

    express: {
      dev: {
        options: {
          script: 'app.js',
          node_env: 'DEV',
          port: ''
        }
      }
    },

    shell: {
      smokeTest: {
        options: {
          stdout: true,
          failOnError: true
        },
        command: 'phantomjs test/phantomjs/psmoke.js'
      }
    }
  });

  // For building angular js
  grunt.registerTask('build', ['uglify']);

  grunt.registerTask('dev', ['uglify', 'express', 'watch']);

  // Clean & verify code (Run before commit)
  grunt.registerTask('default', ['jsbeautifier:modify', 'jshint', 'imagemin']);

  // Verify code (Read only)
  grunt.registerTask('validate', ['jsbeautifier:verify', 'jshint', 'gettext_finder']);

  // Run through all pages and test for JS errors
  // * Requires global install of PhantomJS *
  grunt.registerTask('smoke', 'shell:smokeTest');

};

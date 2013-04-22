
/*!
 * This Gruntfile is used to build the project files.
 */

/*jshint
    asi: true
 */
/*global
    module: true
 */


module.exports = function( grunt ) {

    // Add the "curly" delimiters.
    grunt.template.addDelimiters( 'curly', '{%', '%}' )


    // Load the NPM tasks.
    grunt.loadNpmTasks( 'grunt-contrib-concat' )
    grunt.loadNpmTasks( 'grunt-contrib-watch' )
    grunt.loadNpmTasks( 'grunt-contrib-jshint' )
    grunt.loadNpmTasks( 'grunt-contrib-qunit' )
    grunt.loadNpmTasks( 'grunt-contrib-copy' )
    grunt.loadNpmTasks( 'grunt-contrib-sass' )
    grunt.loadNpmTasks( 'grunt-contrib-clean' )
    grunt.loadNpmTasks( 'grunt-contrib-cssmin' )
    grunt.loadNpmTasks( 'grunt-contrib-uglify' )


    // Create the initial grunt configurations.
    grunt.initConfig({


        // Read the package manifest.
        pkg: grunt.file.readJSON( 'package.json' ),


        // Set up the directories.
        dirs: {
            site: {
                src: '_source/site',
                dest: 'site'
            },
            lib: {
                src: '_source/lib',
                dest: 'lib'
            },
            tests: '_tests/qunit'
        },


        // Clean the destination files and directories.
        clean: {
            site: [ '<%= dirs.site.dest %>', 'index.htm', 'date.htm', 'time.htm' ],
            lib: [ '<%= dirs.lib.dest %>' ]
        },


        // Generate static HTML templates.
        htmlify: {
            site: {
                options: {
                    base: grunt.file.read( '_source/base.htm' )
                },
                files: [
                    { 'index.htm': '_source/index.htm' },
                    { 'date.htm': '_source/date.htm' },
                    { 'time.htm': '_source/time.htm' }
                ]
            }
        },


        // The banner to prepend.
        banner: {
            js: '/*!\n' +
                ' * <%= pkg.title %> v<%= pkg.version %>, <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                ' * By <%= pkg.author.name %> (<%= pkg.author.url %>)\n' +
                ' * Hosted on <%= pkg.homepage %>\n' +
                ' * Licensed under <%= pkg.licenses[0].type %>\n' +
                ' */\n',
            css: '/*!\n' +
                 ' * <%= pkg.title %> v<%= pkg.version %>, <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                 ' * <%= pkg.homepage %> : <%= grunt.task.current.filesSrc %>\n' +
                 ' */'
        },


        // Copy over files to destination directions.
        copy: {

            // Copy the site images over.
            site: {
                expand: true,
                cwd: '<%= dirs.site.src %>/',
                src: [ 'images/*.{png,ico}' ],
                dest: '<%= dirs.site.dest %>/'
            },

            // Copy the lib files over that don't need concatenation.
            lib: {
                expand: true,
                cwd: '<%= dirs.lib.src %>',
                src: [ 'translations/*.js' ],
                dest: '<%= dirs.lib.dest %>/'
            },

            // Copy the package settings into a jquery package.
            pkg: {
                files: { '<%= pkg.name %>.jquery.json': 'package.json' }
            }
        },


        // Convert Sass files into CSS.
        sass: {
            options: {
                style: 'expanded'
            },
            site: {
                files: {
                    '<%= dirs.site.dest %>/styles/main.css': '<%= dirs.site.src %>/styles/base.scss'
                }
            },
            lib: {
                files: {
                    '<%= dirs.lib.dest %>/themes/default.css': '<%= dirs.lib.src %>/themes/default.scss'
                }
            }
        },


        // Concatenate the files and add the banner.
        concat: {
            site: {
                files: { '<%= dirs.site.dest %>/scripts/main.js': '<%= dirs.site.src %>/scripts/*.js' }
            },
            lib: {
                options: {
                    banner: '<%= banner.js %>\n' + '(function( $, document, undefined ) {"use strict";',
                    footer: '})( jQuery, document );'
                },
                files: {
                    '<%= dirs.lib.dest %>/<%= pkg.name %>.datetime.js': [
                        '<%= dirs.lib.src %>/datepicker.js',
                        '<%= dirs.lib.src %>/timepicker.js',
                        '<%= dirs.lib.src %>/basepicker.js'
                    ],
                    '<%= dirs.lib.dest %>/<%= pkg.name %>.date.js': [
                        '<%= dirs.lib.src %>/datepicker.js',
                        '<%= dirs.lib.src %>/basepicker.js'
                    ],
                    '<%= dirs.lib.dest %>/<%= pkg.name %>.time.js': [
                        '<%= dirs.lib.src %>/timepicker.js',
                        '<%= dirs.lib.src %>/basepicker.js'
                    ]
                }
            }
        },


        // Lint the files.
        jshint: {
            gruntfile: 'Gruntfile.js',
            site: [ '<%= dirs.site.src %>/scripts/base.js' ],
            lib: [ '<%= dirs.lib.dest %>/**/*.js', '!<%= dirs.lib.dest %>/legacy.js', '!<%= dirs.lib.dest %>/**/*.min.js', '<%= dirs.tests %>/tests.js' ]
        },


        // Minify everything!
        uglify: {
            options: {
                preserveComments: 'some'
            },
            lib: {
                files: {
                    '<%= dirs.lib.dest %>/<%= pkg.name %>.datetime.min.js': [ '<%= dirs.lib.dest %>/<%= pkg.name %>.datetime.js' ],
                    '<%= dirs.lib.dest %>/<%= pkg.name %>.date.min.js': [ '<%= dirs.lib.dest %>/<%= pkg.name %>.date.js' ],
                    '<%= dirs.lib.dest %>/<%= pkg.name %>.time.min.js': [ '<%= dirs.lib.dest %>/<%= pkg.name %>.time.js' ]
                }
            },
            legacy: {
                files: {
                    '<%= dirs.lib.dest %>/legacy.js': [ '<%= dirs.lib.src %>/legacy.js' ]
                }
            }
        },
        cssmin: {
            lib: {
                options: {
                    banner: '<%= banner.css %>'
                },
                expand: true,
                cwd: '<%= dirs.lib.dest %>',
                src: [ 'themes/*.css', '!themes/*.min.css' ],
                dest: '<%= dirs.lib.dest %>/',
                ext: '.min.css'
            }
        },


        // Unit test the files.
        qunit: {
            lib: [ '<%= dirs.tests %>/qunit.htm' ]
        },


        // Watch the project files.
        watch: {
            gruntfile: {
                files: [ 'Gruntfile.js' ],
                tasks: [ 'jshint:gruntfile', 'default' ]
            },
            site: {
                files: [ '<%= dirs.site.src %>/../*.htm', '<%= dirs.site.src %>/styles/*.scss', '<%= dirs.site.src %>/scripts/*.js' ],
                tasks: [ 'site' ]
            },
            lib: {
                files: [ '<%= dirs.lib.src %>/**/*.js', '<%= dirs.lib.src %>/themes/*.scss' ],
                tasks: [ 'build' ]
            }
        }
    }) //grunt.initConfig


    // Register the tasks.
    grunt.registerTask( 'default', [ 'clean', 'concat', 'copy', 'sass', 'jshint', 'uglify', 'cssmin' ] )
    grunt.registerTask( 'build', [ 'clean:lib', 'concat:lib', 'copy:lib', 'sass:lib', 'jshint:lib', 'qunit:lib', 'uglify:lib', 'cssmin:lib' ] )
    grunt.registerTask( 'site', [ 'clean:site', 'htmlify:site', 'concat:site', 'copy:site', 'sass:site', 'jshint:site' ] )
    grunt.registerTask( 'travis', [ 'concat', 'copy', 'sass', 'jshint', 'qunit' ] )



    // Register the task to build out the static HTML files.
    grunt.registerMultiTask( 'htmlify', 'Build static HTML files', function() {

        var task = this,
            options = this.data.options,
            files = this.data.files

        files.map( function( file ) {

            for ( var dest in file ) {

                // Process the source file.
                var sourceContent = grunt.template.process( grunt.file.read( file[ dest ] ), { delimiters: 'curly' } )

                // Process the base file using the source content.
                var destinationContent = grunt.template.process( options.base, {
                    delimiters: 'curly',
                    data: {
                        content: sourceContent,
                        pkg: grunt.config.data.pkg,
                        page: dest.replace( '.htm', '' )
                    }
                })

                // Create the actual file.
                grunt.file.write( dest, destinationContent )
            }
        })
    })

} //module.exports


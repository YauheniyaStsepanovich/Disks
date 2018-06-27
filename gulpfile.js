/* подключаем gulp и плагины */
var gulp = require('gulp'), // подключаем Gulp
    browserSync = require('browser-sync'), // сервер для работы и автоматического обновления
    plumber = require('gulp-plumber'), // отслеживания ошибок
    rigger = require('gulp-rigger'), // импорт содержимого одного файла в другой
    sourcemaps = require('gulp-sourcemaps'), // генерациz карты исходных файлов
    sass = require('gulp-sass'), //компиляция SASS в CSS
    autoprefixer = require('gulp-autoprefixer'), //автоматическая установки автопрефиксов
    //spritesmith = require('gulp.spritesmith'),
    //concat = require('gulp-concat'),
    //uncss = require('gulp-uncss'), // убрать неиспользуемые css селекторы
    //cssmin = require('gulp-cssmin'),
    cleanCSS = require('gulp-clean-css'), // минимизация CSS
    uglify = require('gulp-uglify'), // минимизации JavaScript
    cache = require('gulp-cache'), // кэширование
    imagemin = require('gulp-imagemin'), //сжатие PNG, JPEG, GIF и SVG изображений
    jpegrecompress = require('imagemin-jpeg-recompress'), // сжатие jpeg	
    pngquant = require('imagemin-pngquant'), // сжатие png
    del = require('del'), // плагин для удаления файлов и каталогов
    embed = require('gulp-image-embed'), // Добавляет картинки в css в формате BASE64
    gulpSequence = require('gulp-sequence'); // выполняет таски по очереди

/* параметры для gulp-autoprefixer */
var autoprefixerList = [
    'Chrome >= 45',
    'Firefox ESR',
    'Edge >= 12',
    'Explorer >= 10',
    'iOS >= 9',
    'Safari >= 9',
    'Android >= 4.4',
    'Opera >= 30'
];
/* пути к исходным файлам (src), к готовым файлам (build), а также к тем, за изменениями которых нужно наблюдать (watch) */
var path = {
    dist: {
        html: 'dist/',
        js: 'dist/js/',
        css: 'dist/css/',
        img: 'dist/img/',
        fonts: 'dist/fonts/'
    },
    src: {
        html: 'app/*.html',
        js: 'app/js/main.js',
        style: 'app/css/main.scss',
        img: 'app/img/**/*.*',
        fonts: 'app/fonts/**/*.*'
    },
    watch: {
        html: 'app/**/*.html',
        js: 'app/js/**/*.js',
        css: 'app/css/**/*.scss',
        img: 'app/img/**/*.*',
        fonts: 'app/fonts/**/*.*'
    },
    deploy: {
        js: 'bx-locale/local/templates/nobilia-rostov/js/',
        css: 'bx-locale/local/templates/nobilia-rostov/css/',
        img: 'bx-locale/local/templates/nobilia-rostov/img/'
    },
    clean: './dist'
};

/* настройки сервера */
var config = {
    server: {
        baseDir: './dist'
    },
    notify: false
};

/* задачи */

// запуск сервера 
gulp.task('browserSync', function () {
    browserSync.init(config);
});

// сборка html
gulp.task('html:build', function () {
    gulp.src(path.src.html) // выбор всех html файлов по указанному пути
        .pipe(plumber()) // отслеживание ошибок
        .pipe(rigger()) // импорт вложений
        .pipe(gulp.dest(path.dist.html)) // выкладывание готовых файлов
        .pipe(browserSync.reload({stream: true})); // перезагрузка сервера
});

// сборка стилей
gulp.task('css:build', function () {
    gulp.src(path.src.style) // получим main.scss
        .pipe(plumber()) // для отслеживания ошибок
        //.pipe(sourcemaps.init()) // инициализируем sourcemap
        .pipe(sass()) // scss -> css
        .pipe(autoprefixer({ // добавим префиксы
            browsers: autoprefixerList
        }))
        .pipe(embed({
            asset: 'app/',
            exclude: [/fonts/],
            extension: ['svg', 'png', 'gif']
        }))
        //
        //.pipe(sourcemaps.write('./')) // записываем sourcemap
        .pipe(gulp.dest(path.dist.css)) // выгружаем в build
        .pipe(cleanCSS()) // минимизируем CSS
        //.pipe(gulp.dest(path.deploy.css))
        .pipe(browserSync.reload({stream: true})); // перезагрузим сервер
});

// сборка js
gulp.task('js:build', function () {
    gulp.src(path.src.js) // получим файл main.js
        .pipe(plumber()) // для отслеживания ошибок
        .pipe(rigger()) // импортируем все указанные файлы в main.js
        //.pipe(sourcemaps.init()) //инициализируем sourcemap
        //
        //.pipe(sourcemaps.write('./')) //  записываем sourcemap
        .pipe(gulp.dest(path.dist.js)) // положим готовый файл
        .pipe(uglify()) // минимизируем js
        //.pipe(gulp.dest(path.deploy.js))
        .pipe(browserSync.reload({stream: true})); // перезагрузим сервер
});

// перенос шрифтов
gulp.task('fonts:build', function () {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.dist.fonts));
});

// обработка картинок
gulp.task('image:build', function () {
    gulp.src(path.src.img) // путь с исходниками картинок
        .pipe(gulp.dest(path.dist.img));
        // .pipe(cache(imagemin([ // сжатие изображений
        //     imagemin.gifsicle({interlaced: true}),
        //     jpegrecompress({
        //         progressive: true,
        //         max: 90,
        //         min: 80
        //     }),
        //     pngquant(),
        //     imagemin.svgo({plugins: [{removeViewBox: false}]})
        // ])))
        //.pipe(gulp.dest(path.deploy.img)); // выгрузка готовых файлов
});

// удаление каталога build 
gulp.task('clean:build', function () {
    del.sync(path.clean);
});

// очистка кэша
gulp.task('cache:clear', function () {
    cache.clearAll();
});

// сборка
gulp.task('build', gulpSequence([
    'clean:build',
    'html:build',
    'css:build',
    'js:build',
    'fonts:build',
    'image:build'
]));

// запуск задач при изменении файлов
gulp.task('watch', function () {
    gulp.watch(path.watch.html, ['html:build']);
    gulp.watch(path.watch.css, ['css:build']);
    gulp.watch(path.watch.js, ['js:build']);
    gulp.watch(path.watch.img, ['image:build']);
    gulp.watch(path.watch.fonts, ['fonts:build']);
});

// задача по умолчанию
gulp.task('default', [
    'clean:build',
    'build',
    'browserSync',
    'watch'
]);


// min css
// gulp.task('css:min', function () {
// 	return gulp.src('dist/assets/main.css')
// 	pipe(uncss({
// 		html: ['dist/*.html']
// 	}))
// 	.pipe(cssmin())
// 	.pipe(rename({suffix: '.min'}))
// 	.pipe(gulp.dest('dist/assets/css'))
// 	.pipe(browserSync.reload({stream: true}));
// });



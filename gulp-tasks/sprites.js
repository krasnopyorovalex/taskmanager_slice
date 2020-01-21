"use strict";

import { paths } from "../gulpfile.babel";
import gulp from "gulp";
import svg from "gulp-svg-sprite";
import debug from "gulp-debug";
import browsersync from "browser-sync";
import replace from "gulp-replace";

gulp.task("sprites", () => {
    return gulp.src(paths.sprites.src)
        .pipe(replace('class="primary"', 'fill="var(--primary)"'))
        .pipe(svg({
            shape: {
                dest: "intermediate-svg"
            },
            mode: {
                stack: {
                    sprite: "../sprite.svg"
                }
            },
            svg: {
                namespaceClassnames: false
            }
        }))
        .pipe(gulp.dest(paths.sprites.dist))
        .pipe(debug({
            "title": "Sprites"
        }))
        .on("end", browsersync.reload);
});

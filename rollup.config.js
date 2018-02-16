import typescript from 'rollup-plugin-typescript';
import uglify from 'rollup-plugin-uglify';
import uglifyEs from "rollup-plugin-uglify-es";
import license from 'rollup-plugin-license';
import camelCase from "lodash.camelCase";
const banner=`@license <%= pkg.name %> v<%= pkg.version %>
(c) <%= moment().format('YYYY') %> Finsi, Inc.
`,
    name = "jquery.snap-puzzle",
    fileName=name,
    packageName =camelCase(name.replace("jquery","jq")),
    src = "./src/index.ts",
    srcUI ="./src/jquery-ui-deps.ts",
    globals= {
        jquery: '$'
    };
export default [
    {
        input: src,
        output: {
            file: `dist/${fileName}.js`,
            name:packageName,
            format: 'umd',
            globals:globals
        },
        plugins: [
            typescript({
                typescript:require("typescript"),
            }),
            license({
                banner:banner
            })
        ],
        external(id) {
            return id.indexOf('node_modules') >= 0;
        }
    },
    //min
    {
        input: src,
        output: {
            file: `dist/${fileName}.min.js`,
            name:packageName,
            format: 'umd',
            globals:globals
        },
        plugins: [
            typescript({
                typescript:require("typescript"),
            }),
            uglify(),
            license({
                banner:banner
            })
        ],
        external(id) {
            return id.indexOf('node_modules') >= 0;
        }
    },
    //ui
    {
        input:srcUI,
        output:{
            file: `dist/jquery-ui-deps.js`,
            name:"jquery-ui-deps",
            format: 'umd',
            globals:globals
        },
        plugins: [
            typescript({
                typescript:require("typescript"),
            })
        ],
        external(id) {
            return id.indexOf('node_modules') >= 0;
        }
    },
    //esm2015
    {
        input: src,
        output: {
            file: `esm2015/${fileName}.js`,
            name:packageName,
            format: 'umd'
        },
        plugins: [
            typescript({
                typescript:require("typescript"),
                target:"es2015"
            }),
            license({
                banner:banner
            })
        ],
        external(id) {
            return id.indexOf('node_modules') >= 0;
        }
    },
    //esm2015 min
    {
        input: src,
        output: {
            file: `esm2015/${fileName}.min.js`,
            name:packageName,
            format: 'umd'
        },
        plugins: [
            typescript({
                typescript:require("typescript"),
                target:"es2015"
            }),
            uglifyEs(),
            license({
                banner:banner
            })
        ],
        external(id) {
            return id.indexOf('node_modules') >= 0;
        }
    },
    //esm2015 ui
    {
        input:srcUI,
        output:{
            file: `dist/jquery-ui-deps.js`,
            name:"jquery-ui-deps",
            format: 'umd',
            globals:globals
        },
        plugins: [
            typescript({
                typescript:require("typescript"),
            })
        ],
        external(id) {
            return id.indexOf('node_modules') >= 0;
        }
    },
]
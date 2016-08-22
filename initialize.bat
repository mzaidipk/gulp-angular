@echo off

set AddPath=E:\MyProjects\gulp-angularjs\node_modules\.bin;E:\MyProjects\gulp-angularjs\node_modules\eslint-config-angular;E:\MyProjects\gulp-angularjs\node_modules\eslint\bin;E:\MyProjects\gulp-angularjs\node_modules\eslint

set Found=N
REM for %%A in ("%PATH:;=","%") do if /i "%%~A" EQU "%AddPath%" set Found=Y
REM if "%Found%" == "N" (
echo %PATH%; | find /i "%AddPath%;" >NUL || (
    echo "not found - so adding path"    
    call setPath.bat
)
echo "Path Set to:"
echo %PATH%
@echo on
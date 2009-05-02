#!/bin/bash
# %*% variables will be replaced in build.xml

cd %BUILDDIR%
mkdir -p chrome/tmp/locale
mv content skin chrome/tmp
cd locale
if [ "$1" == "" ]
then
	mv ./* ../chrome/tmp/locale
else
	mv $* ../chrome/tmp/locale
fi
cd ../
rm -r locale
cd chrome/tmp
zip -r %SHORTNAME%.jar .
cd ../
mv tmp/%SHORTNAME%.jar ./
rm -r tmp
cd ../
rm build*.sh
zip -r %SHORTNAME%_%VERSION%_%BUILD%.xpi .
cd ../
mv  %BUILDDIR%/*.xpi ./
rm -r %BUILDDIR%
echo -n extension build successful
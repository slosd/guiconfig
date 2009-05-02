#!/bin/bash

if [ "$1" == "" ]
then
	cd locale
	folders=$(ls -x)
else
	folders=$*
fi

for l in $folders
do
	echo "locale guiconfig $l jar:chrome/guiconfig.jar!/locale/$l/";
done
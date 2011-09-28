#!/bin/bash
#
# build the XPI file
#
# USAGE
#   build.sh [ SOURCE [ DESTINATION ] ]

APPNAME="gui:config"
SHORTNAME="guiconfig"
VERSION="1.2.1"
BUILD="final"

FFMINVERSION="3.0"
FFMAXVERSION="8.*"

#BUILDTYPE="babelzilla"
BUILDTYPE="release"
LOCALES="cs de en-US es-ES fr it-IT pl pt-BR ru sv-SE zh-CN zh-TW"

BUILDDIR=".tmp"

function validfile() {
  if [ ! -f $1 ]; then return 1; fi
  ext=${1##*.}
  for item in js xul xml manifest rdf
  do
    if [[ "$ext" == "$item" ]]; then return 0; fi
  done
  return 1
}

function replacevars() {
  vars[1]=NAME
  vars[2]=SHORTNAME
  vars[3]=VERSION
  vars[4]=BUILD
  vars[5]=FFMINVERSION
  vars[6]=FFMAXVERSION
  vars[7]=TARGET
  varv[1]=$APPNAME
  varv[2]=$SHORTNAME
  varv[3]=$VERSION
  varv[4]=$BUILD
  varv[5]=$FFMINVERSION
  varv[6]=$FFMAXVERSION
  varv[7]=$BUILDTYPE
  if [ $# -eq 1 ]
  then
    if [ -d $1 ]
    then
      for f in `ls $1`
      do
        replacevars "$1/$f"
      done
    elif validfile $1
    then
      echo "  $1"
      data="$(cat $1)"
      index=0
      count=${#vars[@]}
      while [ $index -lt $count ]
      do
        ((index++))
        data="${data//%${vars[$index]}%/${varv[$index]}}"
      done
      echo "$data" > $1
    fi
  fi
}

function cleanstop() {
  if [ $# -eq 1 -a -d $1 ]
  then
    rm -r $1
  fi
  exit
}

if [ $# -gt 0 ]
then
  if [ -d $1 ]
  then
    cd $1
    SRCDIR=`pwd`
  else
    echo "ERROR: no extension found at $1"
    cleanstop
  fi
else
  SRCDIR=`pwd`
fi

BUILDDIR=$SRCDIR/$BUILDDIR
cd $SRCDIR

if [ -d $BUILDDIR ]
then
  rm -r $BUILDDIR
fi

mkdir -p $BUILDDIR/chrome
cp -r defaults $BUILDDIR
cp -r content skin $BUILDDIR/chrome
cp "chrome:jar.manifest" $BUILDDIR/chrome.manifest
cp "install:jar.rdf" $BUILDDIR/install.rdf
mkdir $BUILDDIR/chrome/locale
rm -r "$BUILDDIR/".* 2> /dev/null

echo "getting locales for $BUILDTYPE build"
case $BUILDTYPE in
  "babelzilla")
    folders=$(ls -x $SRCDIR/locale~$BUILDTYPE) ;;
  *)
    folders=$LOCALES ;;
esac

for l in $folders
do
  if [ -d locale~$BUILDTYPE/$l ]
  then
    cp -r locale~$BUILDTYPE/$l $BUILDDIR/chrome/locale/
    echo "locale guiconfig $l jar:chrome/guiconfig.jar!/locale/$l/" >> $BUILDDIR/chrome.manifest
  else
    echo "ERROR: $l locale not found"
    cleanstop $BUILDDIR
  fi
done

echo "replacing variables in source files"
replacevars $BUILDDIR

echo "create JAR"
cd $BUILDDIR/chrome
zip -r $SHORTNAME.jar ./*
rm -r content skin locale
cd $SRCDIR

echo "create XPI"
cd $BUILDDIR
zip -r "$SRCDIR/${SHORTNAME}_${VERSION}_${BUILD}.xpi" ./*
cd $SRCDIR

if [ $# -gt 1 ]
then
  if [ -d $2 ]
  then
    mv "$SRCDIR/${SHORTNAME}_${VERSION}_${BUILD}.xpi" $2
  fi
fi

echo "successfully built $APPNAME version $VERSION $BUILD build: $SRCDIR/${SHORTNAME}_${VERSION}_${BUILD}.xpi"
cleanstop $BUILDDIR

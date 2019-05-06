#!/bin/bash

pathToPublic="public"
fileIndex="index.html"
file1="index.js"
file2="register-service-worker.js"

file1_md5=($(md5sum ${pathToPublic}/${file1}))
file2_md5=($(md5sum ${pathToPublic}/${file2}))

mv "${pathToPublic}/${file1}" "${pathToPublic}/${file1_md5}.js"
mv "${pathToPublic}/${file2}" "${pathToPublic}/${file2_md5}.js"

sed -e "s/${file1}/${file1_md5}.js/g" -i $pathToPublic/$fileIndex
sed -e "s/${file2}/${file2_md5}.js/g" -i $pathToPublic/$fileIndex

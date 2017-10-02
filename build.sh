declare TARGET_D="@cntr"
declare SOURCE_D="."

rm -rf ${TARGET_D}

mkdir -p ${TARGET_D}
for file_name in $(find ${SOURCE_D}/ -mindepth 0 -maxdepth 1 -type f ! -name '.*' ! -name "build.sh")
do
  cp "${file_name}" ${TARGET_D}/
done

mkdir -p ${TARGET_D}/addons
for file_name in $(find ${SOURCE_D}/addons -mindepth 0 -maxdepth 1 -type f ! -name '.*')
do
  cp "${file_name}" ${TARGET_D}/addons
done

cp -R userconfig ${TARGET_D}/

for dir_name in $(find ${SOURCE_D}/addons -mindepth 1 -maxdepth 1 -type d)
do
  declare BASE_DIR_NAME=$(basename "$dir_name")
  armake build -f -p "${dir_name}" "${TARGET_D}/addons/${BASE_DIR_NAME}.pbo"
done

g++ -m32 -g -std=c++11 -fPIC -shared -o ${TARGET_D}/cntr_exporter.so extensions/cntr_exporter/library.cpp
g++ -std=c++11 -g -fPIC -shared -o ${TARGET_D}/cntr_exporter_x64.so extensions/cntr_exporter/library.cpp
i686-w64-mingw32-g++ -g -std=c++11 -shared -static-libgcc -static-libstdc++ -Wl,-Bstatic -lstdc++ -static -lwinpthread -o ${TARGET_D}/cntr_exporter.dll extensions/cntr_exporter/library.cpp
x86_64-w64-mingw32-g++ -g -std=c++11 -shared -static-libgcc -static-libstdc++ -Wl,-Bstatic -lstdc++ -static -lwinpthread -o ${TARGET_D}/cntr_exporter_x64.dll extensions/cntr_exporter/library.cpp

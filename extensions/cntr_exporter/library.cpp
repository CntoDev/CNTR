#include <string>
#include <cstring>
#include <fstream>
#include <iostream>
#include <sstream>
#include <iomanip>
#include <vector>
#include <ctime>
#include <mutex>

#if defined(_WIN64) || defined(_WIN32)
#define WIN32_LEAN_AND_MEAN
#include <windows.h>

BOOL APIENTRY DllMain( HMODULE hModule, DWORD ul_reason_for_call, LPVOID lpReserved )
{
    switch ( ul_reason_for_call )
    {
        case DLL_PROCESS_ATTACH:
            break;
        case DLL_THREAD_ATTACH:
            break;
        case DLL_THREAD_DETACH:
            break;
        case DLL_PROCESS_DETACH:
            break;
    }
    return TRUE;
}

#define DLLEXPORT __declspec(dllexport)
#define STDCALL __stdcall

#else

#define DLLEXPORT
#define STDCALL

#endif

#define EXTENSION_VERSION "0.9.0"
#define INDEX_FILENAME "index.tsv"
#define TEMP_DIR "Temp"
#define LOG_FILE "logs/cntr.log"
#define MKDIR_TEMP_CMD "mkdir logs"
#define MKDIR_LOG_CMD "mkdir Temp"


std::mutex mutex;
std::ofstream logStream;
std::ofstream fileStream;
std::string captureFileName;
std::string captureFilePath;

struct CaptureInfo
{
    std::string formatVersion;
    std::string missionName;
    std::string worldName;
    std::string author;
    std::string captureInterval;
    std::string exportDir;
    std::time_t time;
};

CaptureInfo captureInfo;


std::string createCaptureFilename( const CaptureInfo& captureInfo )
{
    char timestamp[32];
    strftime( timestamp, sizeof( timestamp ), "__%Y-%m-%d__%H-%M.cntr", localtime( &captureInfo.time ) );

    std::stringstream filename;
    filename << captureInfo.missionName << timestamp;
    std::cout << filename.str();
    return filename.str();
}

void log( const std::string& message )
{
    if (!logStream.is_open()) {
        system( MKDIR_LOG_CMD );
        logStream.open( LOG_FILE );
    }
    logStream << message << std::endl;
}

int getCaptureLength()
{
    int count = 0;

    std::ifstream stream( captureFilePath );
    std::string line;

    while ( std::getline( stream, line ) ) count += 1;

    return count - 1;
}

void startCapture( const CaptureInfo& captureInfo )
{
    captureFileName = createCaptureFilename( captureInfo );

    system( MKDIR_TEMP_CMD );
    captureFilePath = std::string( TEMP_DIR ) + '/' + captureFileName;

    fileStream.open( captureFilePath, std::ios_base::out | std::fstream::app );

    if ( fileStream.is_open() )
    {
        fileStream << captureInfo.formatVersion << ','
                   << captureInfo.missionName << ','
                   << captureInfo.worldName << ','
                   << captureInfo.author << ','
                   << captureInfo.captureInterval << std::endl;
        fileStream.flush();
    }
    else
    {
        log( "CNTR: Error! Cannot open '" + captureFilePath + "'!" );
    }
}

void appendCaptureData( const std::string& captureData )
{
    if ( fileStream.is_open() )
    {
        fileStream << captureData;
        fileStream.flush();
    }
    else
    {
        log( "CNTR: Error! Attempting to write to closed file stream!" );
    }
}

void stopCapture()
{
    if ( fileStream.is_open() )
    {
        fileStream.close();

        auto captureLength = getCaptureLength();

        auto destinationFilePath = captureInfo.exportDir + '/' + captureFileName;

        std::rename( captureFilePath.c_str(), destinationFilePath.c_str() );

        auto timestamp = static_cast<long>( captureInfo.time );

        auto indexFilePath = captureInfo.exportDir + '/' + INDEX_FILENAME;

        std::ofstream indexFile( indexFilePath, std::ios_base::out | std::ios_base::app );
        indexFile << captureInfo.missionName << '\t'
                  << captureInfo.worldName << '\t'
                  << captureLength << '\t'
                  << timestamp << '\t'
                  << captureFileName << std::endl;
    }
    else
    {
        log( "CNTR: Error! File stream already closed!" );
    }
}

std::string parseString( const char* param )
{
    return strlen( param ) > 1 ? std::string( param + 1, strlen( param ) - 2 ) : "";
}

extern "C" DLLEXPORT void STDCALL RVExtensionVersion( char* output, int outputSize )
{
    strncpy( output, EXTENSION_VERSION, strlen( EXTENSION_VERSION ) );
}

extern "C" DLLEXPORT int STDCALL RVExtensionArgs( char* output, int outputSize, const char* function, const char** args, int argCnt )
{
    std::lock_guard<std::mutex> lock( mutex );
    std::string functionName( function );

    if ( functionName == "start" && argCnt == 6 )
    {
        captureInfo = {
                parseString( args[ 0 ] ),
                parseString( args[ 1 ] ),
                parseString( args[ 2 ] ),
                parseString( args[ 3 ] ),
                args[ 4 ],
                parseString( args[ 5 ] ),
                std::time( nullptr )
        };

        startCapture( captureInfo );
    }
    else if ( functionName == "append" && argCnt == 1 )
    {
        appendCaptureData( parseString( args[ 0 ] ) );
    }
    else if ( functionName == "stop" && argCnt == 0 )
    {
        stopCapture();
    }

    return 0;
}

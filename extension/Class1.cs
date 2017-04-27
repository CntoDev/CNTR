/**
 * Author: Shakan
 *
 * ==========================================================================================
 *
 *   Copyright (C) 2016 Jamie Goodson (aka MisterGoodson) (goodsonjamie@yahoo.co.uk)
 *   Copyright (C) 2017 Ivan Šakić (aka Shakan) (ivan.sakic3@gmail.com)
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *
 * ==========================================================================================
 */

using RGiesecke.DllExport;
using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;

namespace CNTRExporter
{
    public class Main
    {
        static string captureDir = @"Temp";
        static string captureFileName = null;
        static string logFile = @"logs\cntr.log";
        static string indexFileName = @"index.json";
        static string[] commandSeparator = { "::" };
        static char[] entrySeparator = { ',' };
        static StreamWriter fileWriter = null;
        static string[] header = null;

#if WIN64
        [DllExport("RVExtension", CallingConvention = CallingConvention.Winapi)]
#else
        [DllExport("_RVExtension@12", CallingConvention = CallingConvention.Winapi)]
#endif
        public static void RVExtension(StringBuilder output, int outputSize, [MarshalAs(UnmanagedType.LPStr)] string function)
        {
            var splitInput = function.Split(commandSeparator, StringSplitOptions.None);

            switch (splitInput[0])
            {
                case "start": StartCapture(splitInput[1]); break;
                case "append": AppendCaptureData(splitInput[1]); break;
                case "stop": StopCapture(splitInput[1]); break;
            }
        }

        private static void StartCapture(string captureHeader)
        {
            try
            {
                header = captureHeader.Split(entrySeparator);
                captureFileName = header[1] + DateTime.Now.ToString("__yyyy-MM-dd__HH-mm") + ".cntr";

                if (fileWriter != null) fileWriter.Close();
                fileWriter = File.CreateText(Path.Combine(captureDir, captureFileName));
                fileWriter.WriteLine(captureHeader);
            }
            catch (Exception exception)
            {
                File.AppendAllText(logFile, exception.Message + Environment.NewLine);
            }
        }

        private static void AppendCaptureData(string captureData)
        {
            try
            {
                lock (fileWriter)
                {
                    if (fileWriter != null) fileWriter.Write(captureData);
                }
            }
            catch (Exception exception)
            {
                File.AppendAllText(logFile, exception.Message);
            }
        }

        private static void StopCapture(string exportDir)
        {
            try
            {
                if (fileWriter != null)
                {
                    fileWriter.Flush();
                    fileWriter.Close();
                }
                if (File.Exists(Path.Combine(captureDir, captureFileName)))
                {
                    var duration = File.ReadAllLines(Path.Combine(captureDir, captureFileName)).Length - 1;
                    File.Copy(Path.Combine(captureDir, captureFileName), Path.Combine(exportDir, captureFileName));
                    File.Delete(Path.Combine(captureDir, captureFileName));
                    UpdateCaptureIndex(exportDir, header[1], header[2], duration, (Int32)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalSeconds, captureFileName);
                }
            }
            catch (Exception exception)
            {
                File.AppendAllText(logFile, exception.Message);
            }
        }

        private static void UpdateCaptureIndex(string exportDir, string worldName, string missionName, int duration, int date, string captureFileName)
        {
            try
            {
                var newLine = Environment.NewLine;
                var entry = 
                    "  {" + newLine +
                    "    \"missionName\": \"" + missionName + "\"," + newLine +
                    "    \"worldName\": \"" + worldName + "\"," + newLine +
                    "    \"duration\": " + duration.ToString() + "," + newLine +
                    "    \"date\": " + date.ToString() + "," + newLine +
                    "    \"captureFileName\": \"" + captureFileName + "\"" + newLine +
                    "  }";

                var exportFilePath = Path.Combine(exportDir, indexFileName);
                if (!File.Exists(exportFilePath))
                {
                    File.WriteAllText(exportFilePath, "[" + newLine + entry + newLine + "]" + newLine);
                }
                else
                {
                    var contents = File.ReadAllText(exportFilePath);
                    var end = newLine + "]" + newLine;
                    File.WriteAllText(exportFilePath, contents.Replace(end, "," + newLine + entry + end));
                }
            }
            catch (Exception exception)
            {
                File.AppendAllText(logFile, exception.Message);
            }
            
        }
    }
}

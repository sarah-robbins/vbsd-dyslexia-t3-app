import React from "react";
import pkg from "@/../package.json";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

interface Props {
  updateStatus: boolean;
}

const VersionBox: React.FC<Props> = ({ updateStatus }) => {
  const version = pkg.version;
  // Determine the class names based on updateStatus
  const versionBoxClass = `relative-container version-box ${
    updateStatus ? "version-box-green" : "version-box-red"
  }`;
  const currentVersionClass = `current-version ${
    updateStatus ? "current-version-green" : "current-version-red"
  }`;
  // Check if the app is updated
  const updateApp =
    updateStatus === true ? (
      <div className="updated flex flex-row justify-content-center">
        <CheckCircleIcon color="primary" className="mr-2" />
        <p className="p-0 m-0">Your app is up to date!</p>
      </div>
    ) : (
      <div className="not-updated flex flex-row justify-content-center">
        <ErrorIcon color="error" className="mr-2" />
        <p className="p-0 m-0">Update available!</p>
      </div>
    );

  return (
    <div className={versionBoxClass}>
      <div className={currentVersionClass}>v{version}</div>
      <div className="version-update-action">{updateApp}</div>
    </div>
  );
};

export default VersionBox;

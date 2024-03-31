import React from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import Link from "@mui/material/Link";
import { Button } from "@mui/material";
import { useRouting } from "@/context/RoutingContext";
import { useSession } from "next-auth/react";

interface Props {
  disabled: boolean;
}

const LoginButton: React.FC<Props> = ({ disabled }) => {
  const { data: session } = useSession();
  const { setRoute } = useRouting();

  const updateAppButton =
    disabled === false ? (
      <Button
        className="w-full"
        variant="contained"
        color="primary"
        onClick={() => {
          void signIn("google", { callbackUrl: "/dashboard" });
          setRoute(session?.user.view || "");
        }}
      >
        Login
      </Button>
    ) : (
      <Button className="w-full" variant="contained" color="error">
        Update
      </Button>
    );

  return (
    <>
      <div className="logo-speeddial card p-card-grey p-overlay-badge shadow-5 border-round-lg p-3 background-primary">
        <div style={{ position: "relative" }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => {
              void signIn("google", { callbackUrl: "/dashboard" });
            }}
            disabled={disabled}
            className="image-container relative-container"
          >
            <Image
              src="/logo.svg"
              // width={245}
              // height={245}
              fill={true}
              alt="dropdown icon"
            />
          </Link>
        </div>
      </div>
      <div className="mt-4 w-full">{updateAppButton}</div>
    </>
  );
};

export default LoginButton;

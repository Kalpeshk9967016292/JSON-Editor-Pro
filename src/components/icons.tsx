import type { SVGProps } from "react";

export function JsonLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1em"
      height="1em"
      {...props}
    >
      <path fill="currentColor" d="M88 64a8 8 0 0 1 8-8h80a8 8 0 0 1 0 16h-42.34l-24 96H120a8 8 0 0 1 0 16H40a8 8 0 0 1 0-16h42.34l24-96H88a8 8 0 0 1-8-8Z" />
    </svg>
  );
}

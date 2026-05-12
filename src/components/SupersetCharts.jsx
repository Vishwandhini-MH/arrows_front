export default function SupersetChart({ url, className }) {
  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <iframe
        src={url}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
      />
    </div>
  );
}

// Temporary fallback component until TinaCMS is properly configured
export default function RichText(props: { content: any }) {
  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: JSON.stringify(props.content) }} />
    </div>
  );
}


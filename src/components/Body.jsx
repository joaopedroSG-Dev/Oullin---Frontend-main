export default function Body({children}) {
  const bodyStyle = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f0f0f0',
    };
  return (    

    <div class="justify-center" style={bodyStyle}>
      {children}
    </div>
  );
}
import logo from '../assets/Logo_principal.png'
export default function Logo({size_height = 200, size_width = 200}) {
  return (
    <img src={logo} alt="Logo" width={size_width} height={size_height} />
  );
}
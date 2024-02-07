import SignUpForm from '@/components/ui/SignUpForm';
import withAuth from '@/server/middlewares/withAuth';
import { countryService } from '@/server/services';

async function SignUp() {
  const countries = await countryService.findAll();
  return <SignUpForm countries={countries} />;
}

export default withAuth(SignUp);

import { SubmitHandler, useForm } from 'react-hook-form';
import Modal from './Modal';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddressDto, CreateUpdateAddressForm } from '@/shared/dtos/address.dto';
import { createUpdateAddressFormSchema } from '@/shared/schemas/address.schema';
import { useEffect, useMemo, useState } from 'react';
import { CountryDto } from '@/shared/dtos/country.dto';
import Image from 'next/image';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi2';
import { useClickOutside } from '@/hooks/useClickOutside';
import { ImSpinner8 } from 'react-icons/im';
import LoadingModal from './LoadingModal';
import { EXCLUDED_COUNTRY_PHONES } from '@/utils/constants';
import { getCountryCodeFromPhoneNumber } from '@/lib/phone';

interface Props {
  address: AddressDto;
  updateAddress(data: AddressDto): void;
  close(): void;
}

// TODO: Refactor (It's bloated)
export function EditAddressForm({ address, updateAddress, close }: Props) {
  const [countries, setCountries] = useState<CountryDto[]>([]);
  const [isLoading, setLoading] = useState(true);

  const [showPhoneCodes, setShowPhoneCodes] = useState(false);
  const [selectedPhoneCountry, setSelectedPhoneCountry] =
    useState<CountryDto | null>(null);

  const countryPhones = useMemo(() => {
    return countries
      .filter((country) => !EXCLUDED_COUNTRY_PHONES.includes(country.id))
      .toSorted((a, b) => {
        if (a.phoneCode > b.phoneCode) return 1;
        else if (a.phoneCode === b.phoneCode) return 0;
        else return -1;
      });
  }, [countries]);

  const phoneCodesRef = useClickOutside<HTMLButtonElement>(() =>
    setShowPhoneCodes(false),
  );

  const [showCountries, setShowCountries] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryDto | null>(
    null,
  );

  const countriesRef = useClickOutside<HTMLButtonElement>(() =>
    setShowCountries(false),
  );

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    setValue,
  } = useForm<CreateUpdateAddressForm>({
    resolver: zodResolver(createUpdateAddressFormSchema),
    defaultValues: {
      nickname: address.nickname,
      contactName: address.contactName,
      phoneNumber: address.phoneNumber.replace(/\+[0-9]+ /, ''),
      phoneCountryCode: getCountryCodeFromPhoneNumber(address.phoneNumber),
      countryId: address.country.id,
      stateId: address.state.id,
      city: address.city,
      postalCode: address.postalCode,
      street: address.street,
      streetDetails: address.streetDetails,
      default: address.default,
    },
  });

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/countries');

      if (res.ok) {
        const data: CountryDto[] = await res.json();
        setCountries(data);

        const phoneCountryCode = getCountryCodeFromPhoneNumber(
          address.phoneNumber,
        )!;

        const phoneCountry =
          data.find((country) => country.id === phoneCountryCode) || null;

        if (phoneCountry) {
          setSelectedPhoneCountry(phoneCountry);
          setValue('phoneCountryCode', phoneCountry.id);
        }

        const country =
          data.find((country) => country.id === address.country.id) || null;

        if (country) {
          setSelectedCountry(country);
          setValue('countryId', country.id);
        }
      }

      setLoading(false);
    })();
  }, [setValue, address.phoneNumber, address.country.id]);

  const onSubmit: SubmitHandler<CreateUpdateAddressForm> = async (data) => {
    const res = await fetch(`/api/addresses/${address.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const data: AddressDto = await res.json();
      updateAddress(data);
      close();
    }
  };

  const handleSelectCountryPhone = (country: CountryDto) => {
    setValue('phoneCountryCode', country.id, { shouldValidate: true });
    setSelectedPhoneCountry(country);
    setShowPhoneCodes(false);
  };

  const handleSelectCountry = (country: CountryDto) => {
    setValue('countryId', country.id, { shouldValidate: true });
    setSelectedCountry(country);
    setShowCountries(false);
  };

  if (isLoading) return <LoadingModal />;

  return (
    <Modal>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full lg:container overflow-y-auto bg-white shadow-md lg:rounded-lg p-10 lg:p-12 border-2 border-gray-50 grid grid-cols-2 gap-4 lg:gap-6"
      >
        <header>
          <h2 className="text-xl font-bold text-green-800">
            Edit {address.nickname}
          </h2>
        </header>
        <div className="col-span-2 space-y-2">
          <label htmlFor="nickname" className="text-green-800 opacity-75">
            Nickname
          </label>
          <input
            {...register('nickname')}
            type="text"
            id="nickname"
            placeholder="Address nickname"
            className="p-3 input"
          />
          {errors.nickname && (
            <p className="text-red-400">{errors.nickname.message}</p>
          )}
        </div>
        <div className="col-span-2 lg:col-span-1 space-y-2">
          <label htmlFor="contact-name" className="text-green-800 opacity-75">
            Contact name
          </label>
          <input
            {...register('contactName')}
            type="text"
            id="contact-name"
            placeholder="Enter contact name"
            className="p-3 input"
          />
          {errors.contactName && (
            <p className="text-red-400">{errors.contactName.message}</p>
          )}
        </div>
        <div className="col-span-2 lg:col-span-1 space-y-2">
          <label htmlFor="phone-number" className="text-green-800 opacity-75">
            Phone number
          </label>
          <div className="relative">
            <div className="flex items-center gap-2 input p-3 focus-within:border-green-800">
              <div>
                <button
                  ref={phoneCodesRef}
                  type="button"
                  className="flex items-center gap-1 text-sm"
                  onClick={() => setShowPhoneCodes((prev) => !prev)}
                >
                  <>
                    {selectedPhoneCountry && (
                      <Image
                        src={`https://flagcdn.com/${selectedPhoneCountry.id.toLowerCase()}.svg`}
                        alt={selectedPhoneCountry.name + ' Flag'}
                        width={0}
                        height={0}
                        className="w-6 h-auto"
                      />
                    )}
                    {!showPhoneCodes ? <HiChevronDown /> : <HiChevronUp />}
                  </>
                </button>
              </div>
              <div>
                <input
                  {...register('phoneNumber')}
                  type="text"
                  id="phone-number"
                  placeholder="Enter phone number"
                  className="w-full bg-transparent"
                />
              </div>
            </div>
            {showPhoneCodes && (
              <ul className="z-10 absolute top-14 left-0 bg-slate-50 p-2 rounded-md shadow-md w-32 h-80 overflow-y-auto">
                {countryPhones.map((country) => (
                  <li key={country.id}>
                    <button
                      type="button"
                      className="w-full flex items-center gap-1 py-1 text-sm text-slate-800 hover:text-green-700 focus:text-green-700 transition"
                      onClick={() => handleSelectCountryPhone(country)}
                    >
                      <Image
                        src={`https://flagcdn.com/${country.id.toLowerCase()}.svg`}
                        alt={country.name + ' Flag'}
                        width={0}
                        height={0}
                        className="w-6 h-auto"
                      />
                      <span className="line-clamp-1">+{country.phoneCode}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {errors.phoneNumber && (
            <p className="text-red-400">{errors.phoneNumber.message}</p>
          )}
        </div>
        <div className="relative col-span-2 lg:col-span-1 space-y-2">
          <label htmlFor="country" className="text-green-800 opacity-75">
            Country
          </label>
          <button
            ref={countriesRef}
            type="button"
            className="p-3 input flex items-center justify-between"
            onClick={() => setShowCountries((prev) => !prev)}
          >
            <>
              {selectedCountry ? (
                <div className="flex items-center gap-1">
                  <Image
                    src={`https://flagcdn.com/${selectedCountry.id.toLowerCase()}.svg`}
                    alt={selectedCountry.name + ' Flag'}
                    width={0}
                    height={0}
                    className="w-6 h-auto"
                  />
                  <span className="line-clamp-1">{selectedCountry.name}</span>
                </div>
              ) : (
                <span>Select country</span>
              )}
              {!showCountries ? <HiChevronDown /> : <HiChevronUp />}
            </>
          </button>
          {showCountries && (
            <ul className="z-10 absolute top-[5.5rem] bg-slate-50 p-2 rounded-md shadow-md w-full h-80 overflow-y-auto">
              {countries.map((country) => (
                <li key={country.id}>
                  <button
                    type="button"
                    className="w-full flex items-center gap-1 py-1 text-sm text-slate-800 hover:text-green-700 focus:text-green-700 transition"
                    onClick={() => handleSelectCountry(country)}
                  >
                    <Image
                      src={`https://flagcdn.com/${country.id.toLowerCase()}.svg`}
                      alt={country.name + ' Flag'}
                      width={0}
                      height={0}
                      className="w-6 h-auto"
                    />
                    <span className="line-clamp-1 text-left">
                      {country.name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {errors.countryId && (
            <p className="text-red-400">{errors.countryId.message}</p>
          )}
        </div>
        <div className="col-span-2 lg:col-span-1 space-y-2">
          <label htmlFor="state" className="text-green-800 opacity-75">
            State
          </label>
          <select
            {...register('stateId', { valueAsNumber: true })}
            id="state"
            className="p-3 input"
            disabled={!selectedCountry}
            defaultValue={address.state.id}
          >
            <option value="" disabled>
              Select state
            </option>
            {selectedCountry && (
              <>
                {selectedCountry.states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name || '(No state)'}
                  </option>
                ))}
              </>
            )}
          </select>
          {errors.stateId && (
            <p className="text-red-400">{errors.stateId.message}</p>
          )}
        </div>
        <div className="col-span-2 lg:col-span-1 space-y-2">
          <label htmlFor="city" className="text-green-800 opacity-75">
            City
          </label>
          <input
            {...register('city')}
            type="text"
            id="city"
            placeholder="Enter city"
            className="p-3 input"
          />
          {errors.city && <p className="text-red-400">{errors.city.message}</p>}
        </div>
        <div className="col-span-2 lg:col-span-1 space-y-2">
          <label htmlFor="postal-code" className="text-green-800 opacity-75">
            Zip/Postal code
          </label>
          <input
            {...register('postalCode')}
            type="text"
            id="postal-code"
            placeholder="Enter zip/postal code if available"
            className="p-3 input"
          />
          {errors.postalCode && (
            <p className="text-red-400">{errors.postalCode.message}</p>
          )}
        </div>
        <div className="col-span-2 space-y-2">
          <label htmlFor="street" className="text-green-800 opacity-75">
            Street
          </label>
          <input
            {...register('street')}
            type="text"
            id="street"
            placeholder="Street address"
            className="p-3 input"
          />
          {errors.street && (
            <p className="text-red-400">{errors.street.message}</p>
          )}
        </div>
        <div className="col-span-2 space-y-2">
          <label
            hidden
            htmlFor="street-details"
            className="text-green-800 opacity-75"
          >
            Street details
          </label>
          <input
            {...register('streetDetails')}
            type="text"
            id="street-details"
            placeholder="Apartment, suite, etc. (Optional)"
            className="p-3 input"
          />
          {errors.streetDetails && (
            <p className="text-red-400">{errors.streetDetails.message}</p>
          )}
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <input
            {...register('default')}
            type="checkbox"
            id="default"
            className="w-4 h-4 bg-slate-50 accent-green-800"
          />
          <label htmlFor="default" className="text-green-800 opacity-75">
            Set as default
          </label>
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <button
            type="submit"
            className={`px-5 py-2 flex items-center gap-2 ${
              isSubmitting ? 'btn-disabled' : 'btn'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting && <ImSpinner8 className="animate-spin" />}
            Update
          </button>
          <button
            type="button"
            onClick={close}
            className="px-5 py-2 btn-alternative"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
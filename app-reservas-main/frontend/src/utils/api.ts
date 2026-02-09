const AUTH_URL = process.env.NEXT_PUBLIC_API_URL;
const USER_URL = process.env.NEXT_PUBLIC_USER_URL;
const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL; // GraphQL endpoint

export type BookingDTO = {
    id: string;
    servicio: string;
    fecha: string;
    estado: string;
    canceladaEn?: string | null;
    fechaFormateada?: string | null;
};

async function bookingGraphQL<T>(query: string, variables: Record<string, unknown> = {}, token?: string): Promise<T> {
    const res = await fetch(BOOKING_URL!, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ query, variables })
    });

    const data = await res.json();
    if (!res.ok || data.errors) {
        const msg = data.errors?.[0]?.message || data.message || 'Error en GraphQL';
        throw new Error(msg);
    }
    return data.data;
}

export const registerUser = async (data: { name: string; email: string; password: string }) => {
    const res = await fetch(`${AUTH_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    return res.json();
};

export const loginUser = async (data: { email: string; password: string }) => {
    const res = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    return res.json();
};

export const getMe = async (token: string) => {
    const res = await fetch(`${USER_URL}/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.json();
};

export const getBookings = async (token: string) => {
    const data = await bookingGraphQL<{ bookings: BookingDTO[] }>(
        `query { bookings { id servicio fecha estado fechaFormateada } }`,
        {},
        token
    );
    return data.bookings;
};

export const createBooking = async (token: string, input: { fecha: string; servicio: string }) => {
    const data = await bookingGraphQL<{ createBooking: BookingDTO }>(
        `mutation ($fecha: String!, $servicio: String!) { createBooking(fecha: $fecha, servicio: $servicio) { id servicio estado fecha } }`,
        input,
        token
    );
    return data.createBooking;
};

export const cancelBooking = async (token: string, id: string) => {
    const data = await bookingGraphQL<{ cancelBooking: BookingDTO }>(
        `mutation ($id: ID!) { cancelBooking(id: $id) { id estado canceladaEn } }`,
        { id },
        token
    );
    return data.cancelBooking;
};

export const upcomingBookings = async (token: string) => {
    const data = await bookingGraphQL<{ upcomingBookings: BookingDTO[] }>(
        `query { upcomingBookings { id servicio fecha estado } }`,
        {},
        token
    );
    return data.upcomingBookings;
};


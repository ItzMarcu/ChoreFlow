import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();
const sql = neon(process.env.DB_CONNECTION_STRING);

export async function login(name, password) {
    try {
        const row = await sql`
            SELECT * 
            FROM users 
            WHERE name = TRIM(${name}) AND password = TRIM(${password})
        `;

        if (row.length === 0) {
            return {
                succes: false,
                message: 'Credenziali non trovate'
            };
        }

        const user = row[0];
        
        return {
            succes: true,
            id: user.id,
            nome: user.name,
            house_url: user.house_url
        };
        
    } catch (error) {
        return {
            succes: false,
            message: error.message
        };
    }
}

export async function create_house(house_name) {
    try {
        const URL_ID = 'CHORE-' + Math.random().toString(32).substring(4).toUpperCase();

        await sql`
            INSERT INTO houses (nome_casa, url)
            VALUES (${house_name}, ${URL_ID})
        `;

        return {
            succes: true,
            house_url: URL_ID,
            house_name: house_name
        };
    } catch(error) {
        console.error(error);
        return {
            succes: false,
            error: error.message
        };
    }
}

export async function get_house(house_url) {
    try {
        const rows = await sql`
            SELECT *
            FROM houses 
            WHERE url = ${house_url}
        `;
        
        if (rows.length === 0) {
            return {
                succes: true,
                houses: null
            };
        }

        const [house] = rows;
        return {
            succes: true,
            houses: house    
        }
        
    } catch(error) {
        console.error(error); 
        return {
            succes: false,
            error: error.message
        };
    }
}

export async function create_user(name, password, house_url) {
    try {
        const allUsers = await get_all_users();
        if (allUsers.users && allUsers.users.includes(name)) {
            return {
                succes: false,
                message: 'Nome utente non disponibile'
            };
        }

        await sql`
            INSERT INTO users (name, password, house_url) 
            VALUES (${name}, ${password}, ${house_url})
        `

        return {
            succes: true,
            message: 'Utente registrato con successo'
        };

    } catch (error) {
        return {
            succes: false, 
            error: error.message    
        };
    }
}

export async function get_users(house_url) {
    try {
        const rows = await sql`
            SELECT name
            FROM users 
            WHERE TRIM(house_url) = TRIM(${house_url});
        `;

        if (rows.length === 0) {
            return {
                succes: true,
                users: null
            };
        }

        const users = rows.map(user => user.name);
        return {
            succes: true,
            users: users
        };

    } catch (error) {
        return {
            succes: false,
            error: error.message 
        };
    } 
}

export async function get_all_users() {
    try {
        const rows = await sql`
        SELECT name
        FROM users
        `;

        if (rows.length === 0) {
            return {
                succes: true, 
                users: null
            };
        }

        const users = rows.map(user => user.name);
        return {
            succes: true,
            users: users
        }  

    } catch (error) {
        return {
            succes: false,
            error: error.message
        };
    }
}

export async function leave_house(name, house_url) {
    try {
        await sql`
            UPDATE users 
            SET house_url = NULL
            WHERE name = ${name} AND house_url = ${house_url}
        `;

        return {
            succes: true,
            message: 'Casa lasciata con successo'
        };

    } catch (error) {
        return {
            succes: false,
            error: error.message
        };
    }
}

export async function delete_user(name, password) {
    try {
        await sql`
            DELETE 
            FROM users 
            WHERE name = ${name} AND password = ${password}
        `;

        return {
            succes: true,
            message: 'Utente eleminato con successo'
        };

    } catch (error) {
        return {
            succes: false,
            message: error.message
        };
    }
}

export async function join_house(name, house_url) {
    try {
        await sql`
            UPDATE users
            SET house_url = ${house_url}
            WHERE name = ${name}
        `
        
        return {
            succes: true,
            message: 'Utente aggiunto alla casa con successo'
        };
    } catch (error) {
        return {
            succes: false,
            error: error.message
        };
    } 
}

export async function create_room(house_url, nome) {
    try {
        const created_at = new Date().toISOString(); 
        await sql`
            INSERT INTO rooms (house_url, nome, created_at)
            VALUES (${house_url}, ${nome}, ${created_at});
        `;

        return {
            succes: true,
            message: 'Stanza creata con successo'
        };

    } catch (error) {
        return {
            succes: false, 
            error: error.message
        };
    }
}

export async function delete_room(house_url, name) {
    try {
        await sql`
            DELETE 
            FROM rooms
            WHERE nome = ${name} AND house_url = ${house_url}
        `;

        return {
            succes: true,
            message: 'Stanza eliminata con successo'
        };

    } catch (error) {
        return {
            succes: false,
            error: error.message
        };
    }
}

export async function get_rooms(house_url) {
    try {
        const rows = await sql`
            SELECT *
            FROM rooms
            WHERE house_url = ${house_url}
        `;

        const [rooms] = rows;
        return {
            succes: true,
            rooms: [rooms]
        };
    } catch (error) {
        return {
            succes: false,
            error: error.message
        };
    }
}
collection chat:

-   string chatKey: uid1_uid2

-   timestamp createdAt

-   timestamp lastUpdate

-   string type : always set to "private"

-   array users

-   collection messages

    -   string content

    -   timestamp created_at

    -   string sender_id

collection group:

-   string bio

-   timestamp createdAt

-   timestamp lastUpdate

-   string name

-   string pfp

-   string type: always set to "group"

-   array users

-   collection messages:

    -   string content

    -   timestamp created_at

    -   string sender_id

    -   array admins: list of ids of admins of this group

collection users

-   string bio

-   string email

-   timestamp lastOnline

-   string pfp

-   string role:always set to "user" for now

-   boolean status

-   string username

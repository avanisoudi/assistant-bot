CREATE TABLE `botSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phoneNumber` varchar(32) NOT NULL,
	`status` enum('idle','connecting','connected','error') NOT NULL DEFAULT 'idle',
	`pairingCode` varchar(16),
	`pairingCodeExpiresAt` timestamp,
	`codeSent` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `botSessions_id` PRIMARY KEY(`id`)
);
